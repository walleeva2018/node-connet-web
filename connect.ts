import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  VirtualMachineService,
  CreateVirtualMachineRequestSchema,
  CreateVirtualMachineResponseSchema,
  ListVirtualMachinesRequestSchema,
  ListVirtualMachinesResponseSchema,
  VirtualMachineSchema,
  type CreateVirtualMachineRequest,
  type ListVirtualMachinesRequest,
} from "./gen/vm/v1/vm_pb.js";

// In-memory storage for demo purposes
const virtualMachines: Array<{
  id: number;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  status: string;
  region: string;
  image: string;
  size: string;
  ipAddress: string;
  tags: string[];
  createdAt: string;
  priceMonthly: number;
}> = [];

let nextId = 1;

export default function (router: ConnectRouter) {
  router.service(VirtualMachineService, {
    // Create a new Virtual Machine
    createVirtualMachine: async (request: CreateVirtualMachineRequest) => {
      const vm = {
        id: nextId++,
        name: `vm-${Date.now()}`,
        memory: getSizeMemory(request.size),
        vcpus: getSizeVCPUs(request.size),
        disk: getSizeDisk(request.size),
        status: "creating",
        region: request.region,
        image: request.image,
        size: request.size,
        ipAddress: generateRandomIP(),
        tags: request.tags,
        createdAt: new Date().toISOString(),
        priceMonthly: getSizePrice(request.size),
      };

      // Add to our in-memory storage
      virtualMachines.push(vm);

      // Simulate async creation
      setTimeout(() => {
        vm.status = "active";
      }, 2000);

      return create(CreateVirtualMachineResponseSchema, {
        virtualMachine: create(VirtualMachineSchema, vm),
      });
    },

    // List Virtual Machines
    listVirtualMachines: async (request: ListVirtualMachinesRequest) => {
      let filtered = virtualMachines;

      // Filter by region if specified
      if (request.region) {
        filtered = filtered.filter((vm) => vm.region === request.region);
      }

      // Filter by tag if specified
      if (request.tag) {
        filtered = filtered.filter((vm) => vm.tags.includes(request.tag));
      }

      // Simple pagination
      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedVMs = filtered.slice(start, end);

      const nextPageToken = end < filtered.length ? end.toString() : "";

      return create(ListVirtualMachinesResponseSchema, {
        virtualMachines: paginatedVMs.map((vm) =>
          create(VirtualMachineSchema, vm)
        ),
        nextPageToken,
        totalCount: filtered.length,
      });
    },
  });
}

// Helper functions for VM sizing
function getSizeMemory(size: string): number {
  const sizes: Record<string, number> = {
    "s-1vcpu-1gb": 1024,
    "s-2vcpu-2gb": 2048,
    "s-4vcpu-8gb": 8192,
    "c-2": 4096,
    "c-4": 8192,
  };
  return sizes[size] || 1024;
}

function getSizeVCPUs(size: string): number {
  const sizes: Record<string, number> = {
    "s-1vcpu-1gb": 1,
    "s-2vcpu-2gb": 2,
    "s-4vcpu-8gb": 4,
    "c-2": 2,
    "c-4": 4,
  };
  return sizes[size] || 1;
}

function getSizeDisk(size: string): number {
  const sizes: Record<string, number> = {
    "s-1vcpu-1gb": 25,
    "s-2vcpu-2gb": 50,
    "s-4vcpu-8gb": 80,
    "c-2": 50,
    "c-4": 80,
  };
  return sizes[size] || 25;
}

function getSizePrice(size: string): number {
  const prices: Record<string, number> = {
    "s-1vcpu-1gb": 5.0,
    "s-2vcpu-2gb": 10.0,
    "s-4vcpu-8gb": 40.0,
    "c-2": 20.0,
    "c-4": 40.0,
  };
  return prices[size] || 5.0;
}

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}
