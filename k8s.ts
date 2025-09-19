import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  KubernetesClusterService,
  CreateClusterRequestSchema,
  CreateClusterResponseSchema,
  ListClustersRequestSchema,
  ListClustersResponseSchema,
  ClusterSchema,
  NodePoolSchema,
  type CreateClusterRequest,
  type ListClustersRequest,
  type NodePool,
} from "./gen/kubernetes/v1/k8s_pb.js";

// In-memory storage for demo purposes
const clusters: Array<{
  id: string;
  name: string;
  region: string;
  version: string;
  endpoint: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  nodePools: Array<{
    size: string;
    count: number;
    name: string;
    tags: string[];
    labels: Record<string, string>;
  }>;
}> = [];

let nextId = 1;

export default function (router: ConnectRouter) {
  router.service(KubernetesClusterService, {
    // Create a new Kubernetes Cluster
    createCluster: async (request: CreateClusterRequest) => {
      const clusterId = `k8s-${nextId++}-${Date.now()}`;

      const cluster = {
        id: clusterId,
        name: request.name,
        region: request.region,
        version: request.version,
        endpoint: `https://${clusterId}.${request.region}.k8s.ondigitalocean.com`,
        status: "provisioning",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: request.tags,
        nodePools: request.nodePools.map((pool) => ({
          size: pool.size,
          count: pool.count,
          name: pool.name,
          tags: pool.tags,
          labels: Object.fromEntries(Object.entries(pool.labels)),
        })),
      };

      // Add to our in-memory storage
      clusters.push(cluster);

      // Simulate async cluster creation
      setTimeout(() => {
        cluster.status = "running";
        cluster.updatedAt = new Date().toISOString();
      }, 10000); // K8s clusters take longer than VMs

      // Simulate node provisioning stages
      setTimeout(() => {
        cluster.status = "provisioning-nodes";
        cluster.updatedAt = new Date().toISOString();
      }, 3000);

      return create(CreateClusterResponseSchema, {
        cluster: create(ClusterSchema, {
          id: cluster.id,
          name: cluster.name,
          region: cluster.region,
          version: cluster.version,
          endpoint: cluster.endpoint,
          status: cluster.status,
          createdAt: cluster.createdAt,
          updatedAt: cluster.updatedAt,
          tags: cluster.tags,
          nodePools: cluster.nodePools.map((pool) =>
            create(NodePoolSchema, {
              size: pool.size,
              count: pool.count,
              name: pool.name,
              tags: pool.tags,
              labels: pool.labels,
            })
          ),
        }),
      });
    },

    // List all Kubernetes clusters
    listClusters: async (request: ListClustersRequest) => {
      let filteredClusters = clusters;

      // Filter by region if specified
      if (request.region) {
        filteredClusters = filteredClusters.filter(
          (cluster) => cluster.region === request.region
        );
      }

      // Filter by tags if specified
      if (request.tags && request.tags.length > 0) {
        filteredClusters = filteredClusters.filter((cluster) =>
          request.tags.some((tag) => cluster.tags.includes(tag))
        );
      }

      return create(ListClustersResponseSchema, {
        clusters: filteredClusters.map((cluster) =>
          create(ClusterSchema, {
            id: cluster.id,
            name: cluster.name,
            region: cluster.region,
            version: cluster.version,
            endpoint: cluster.endpoint,
            status: cluster.status,
            createdAt: cluster.createdAt,
            updatedAt: cluster.updatedAt,
            tags: cluster.tags,
            nodePools: cluster.nodePools.map((pool) =>
              create(NodePoolSchema, {
                size: pool.size,
                count: pool.count,
                name: pool.name,
                tags: pool.tags,
                labels: pool.labels,
              })
            ),
          })
        ),
        totalCount: filteredClusters.length,
      });
    },
  });
}

// Helper functions for cluster validation and utilities
function validateClusterName(name: string): boolean {
  // K8s cluster names must be DNS compliant
  const dnsRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
  return dnsRegex.test(name) && name.length <= 63;
}

function validateKubernetesVersion(version: string): boolean {
  // Validate version format (e.g., "1.14.1-do.4")
  const versionRegex = /^\d+\.\d+\.\d+(-do\.\d+)?$/;
  return versionRegex.test(version);
}

function validateNodePoolSize(size: string): boolean {
  const validSizes = [
    "s-1vcpu-2gb",
    "s-2vcpu-2gb",
    "s-2vcpu-4gb",
    "s-4vcpu-8gb",
    "s-8vcpu-16gb",
    "c-2",
    "c-4",
    "c-8",
    "c-16",
    "m-2vcpu-16gb",
    "m-4vcpu-32gb",
  ];
  return validSizes.includes(size);
}

function validateRegion(region: string): boolean {
  const validRegions = [
    "nyc1",
    "nyc2",
    "nyc3",
    "ams2",
    "ams3",
    "sfo1",
    "sfo2",
    "sfo3",
    "sgp1",
    "lon1",
    "fra1",
    "tor1",
    "blr1",
    "syd1",
  ];
  return validRegions.includes(region);
}

