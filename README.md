`npm i`

then

`npx buf generate`

example

Listing VMs

```
curl \
  --header 'Content-Type: application/json' \
  --data '{
    "pageSize": 10,
    "pageToken": "",
    "tag": "",
    "region": ""
  }' \
  http://localhost:8080/vm.v1.VirtualMachineService/ListVirtualMachines
```

Creating VMs

```
curl \
  --header 'Content-Type: application/json' \
  --data '{
    "region": "nyc1",
    "size": "s-1vcpu-1gb",
    "image": "ubuntu-20-04-x64",
    "sshKeys": ["your-ssh-key-fingerprint"],
    "backups": false,
    "ipv6": false,
    "monitoring": true,
    "tags": ["web", "production"]
  }' \
  http://localhost:8080/vm.v1.VirtualMachineService/CreateVirtualMachine
```
