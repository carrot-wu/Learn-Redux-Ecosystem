>最近又新买了一台服务器2c4g，捣鼓着如何折腾一波k8s

## 目前机器配置
目前总共有三台机器，配置都一般具体如下：
1. 2c4g5m带宽云服务器，部署在腾讯云。
2. 2c4g3m带宽云服务器，部署在腾讯云。
3. 1c2g1m带宽云服务器，部署在阿里云。

## 安装docker

我们将使用 Docker 将应用打包成一个镜像，交给 Kubernetes 去部署在目标服务集群，所以第一步操作先安装docker

### 安装persistent-data 和 lvm2

`device-mapper-persistent-data` 是 Linux 下的一个存储驱动， Linux 上的高级存储技术。 `Lvm` 的作用则是创建逻辑磁盘分区。这里我们使用 CentOS 的 Yum 包管理器安装两个依赖：

```js 
yum install -y yum-utils device-mapper-persistent-data lvm2

```

### 修改docker安装源以及安装docker

依赖安装完毕后，我们将阿里云的 Docker 镜像源添加进去。可以加速 Docker 的安装。记住安装的是docker-ce而不是docker这里是个坑.

```js 
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install docker-ce -y
```

### 启动docker
安装完毕，我们就可以使用 `systemctl` 启动来启动 Docker 了。`systemctl` 是 Linux 的进程管理服务命令，他可以帮助我们启动 docker .  

```js 
systemctl start docker
systemctl enable docker
```

### 切换docker镜像源

一般来说拉取的镜像源是国外的dockerhub，太慢了。所以这边需要切换镜像源，可以默认阿里云的镜像地址即可当然也可以选择腾讯云清华等等自行选择。  

![alt](http://img.carrotwu.com/FhcZV7vVEK04bLBVser5RlnGZICS)

## 安装k8s

在 `Kubernetes` 中，可以使用集群来组织服务器的。集群中会存在一个 `Master` 节点，该节点是 `Kubernetes` 集群的控制节点，负责调度集群中其他服务器的资源。其他节点被称为 Node ， Node 可以是物理机也可以是虚拟机。

### 安装vim,wget,ntpdate
第一步我们安装些必备组件。`vim` 是 `Linux` 下的一个文件编辑器； `wget` 可以用作文件下载使用； `ntpdate` 则是可以用来同步时区：  

```js 
yum install vim wget ntpdate -y
```

### 关闭防火墙规则以及swap分区

接着我们关闭防火墙。因为 `kubernetes` 会创建防火墙规则，导致防火墙规则重复。所以这里我们要将防火墙关闭：

```js 
systemctl stop firewalld & systemctl disable firewalld
```

这一步需要我们关闭 `Swap` 分区。 `Swap` 是 Linux 的交换分区，在系统资源不足时，`Swap` 分区会启用。这操作会拖慢我们的应用性能。

应该让新创建的服务自动调度到集群的其他 Node 节点中去，而不是使用 `Swap` 分区。这里我们将它关闭掉：

```js 
#临时关闭
swapoff -a
# 永久关闭
vi /etc/fstab
```

找到 /etc/fstab 文件，注释掉下面这一行：

```js 
/dev/mapper/centos-swap swap ...
```

继续关闭 Selinux。这是为了支持容器可以访问宿主机文件系统所做的，后续也许会优化掉：

```js 
# 暂时关闭 selinux
setenforce 0

# 永久关闭
vi /etc/sysconfig/selinux
# 修改以下参数，设置为disable
SELINUX=disabled
```

### ntpdate 统一时间

接着使用 `ntpdate` 来统一我们的系统时间和时区，服务器时间与阿里云服务器对齐。

```js 
# 统一时区，为上海时区
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
bash -c "echo 'Asia/Shanghai' > /etc/timezone"

# 统一使用阿里服务器进行时间更新
ntpdate ntp1.aliyun.com
```

## 安装 Kubernetes 组件

从这里我们开始安装 Kubernetes 的相关组件，首先先将安装源更换为为国内的阿里云源：

```js 
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```

接着直接使用 yum 命令安装 `kubelet、 kubeadm、kubectl` 即可，安装完毕后启用 kubelet 即可。

```js 
yum install -y kubelet kubeadm kubectl
# 启动kubelet
systemctl enable kubelet && systemctl start kubelet
```

`kubelet` 是 `Kubernetes` 中的核心组件。它会运行在集群的所有节点上，并负责创建启动服务容器 `kubectl` 则是`Kubernetes`的命令行工具。可以用来管理，删除，创建资源 `kubeadm`  则是用来初始化集群，子节点加入的工具。

### master节点的安装

Master 节点是集群内的调度和主要节点，以下内容只针对于master节点，我的master节点机器为2c4g的3m腾讯云服务器。

首先，我们使用 `hostnamectl` 来修改主机名称为 master 。`hostnamectl` 是 `Centos7` 出的新命令，可以用来修改主机名称：

```js 
hostnamectl set-hostname  master

```  

接着使用 `ip addr` 命令(注意区分内网ip以及外网ip)，获取本机IP，将其添加到 `/etc/hosts` 内：

```js 
# xxx.xxx.xxx.xxx master
vim /etc/hosts

```  
注意的是IP地址得选择正确此处的IP地址并不是内网或者公网的ip地址: 

```js 
[root@VM-16-12-centos k8s]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 52:54:00:ca:43:c5 brd ff:ff:ff:ff:ff:ff
    必须选择此处的IP地址 如果没有的话请百度查找解决办法
    inet xxx.xx.xx/20 brd xxx scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:feca:43c5/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:26:05:60:0f brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global docker0
       valid_lft forever preferred_lft forever
```

#### 配置 Kubernetes 初始化文件

接着我们使用 `kubeadm config print init-defaults` 输出一份默认初始化配置文件，使用 > 操作符即可导出为一份文件，方便我们进行修改。

```js 
kubeadm config print init-defaults > init-kubeadm.conf
vim init-kubeadm.conf
```

修改默认配置(注意master的IP地址为公网或者是内网)：

```js 
# imageRepository: k8s.gcr.io 更换k8s镜像仓库
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers
# localAPIEndpointc，advertiseAddress为master-ip ，port默认不修改
localAPIEndpoint:
  advertiseAddress: xxx  # 此处为master的IP
  bindPort: 6443
# 配置子网络
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.244.0.0/16	# 添加这个
```
1. 更换 `Kubernetes` 镜像仓库为阿里云镜像仓库，加速组件拉取
2. 替换 `ip` 为自己主机 `ip`
3. 配置 `pod` 网络为 `flannel` 网段

在修改完配置文件后，我们需要使用 `kubeadm` 拉取我们的默认组件镜像。直接使用 `kubeadm config images pull` 命令即可

#### 初始化 Kubernetes

在镜像拉取后，我们就可以使用刚才编辑好的配置文件去初始化 `Kubernetes` 集群了。这里直接使用 `kubeadm init` 命令去初始化即可。

```js 

kubeadm init --config init-kubeadm.conf

```
在静等运行一会后，终端会给出以下提示：


![alt](http://img.carrotwu.com/FkaEe79dLLLUtc9F3Z6f5j5S0Cf0)

其中，红框命令为在 `Master` 节点需要执行的初始化命令，其作用为将默认的 `Kubernetes` 认证文件拷贝进 .kube 文件夹内，才能默认使用该配置文件。

蓝框为需要在 node 节点执行的命令。作用是可以快速将 Node 节点加入到 `Master` 集群内。

#### 安装 Flannel

前面我们在配置文件中，有提到过配置Pod子网络，**`Flannel` 主要的作用就是如此。它的主要作用是通过创建一个虚拟网络，让不同节点下的服务有着全局唯一的IP地址，且服务之前可以互相访问和连接**。

那么 `Flannel` 作为 `Kubernetes` 的一个组件，则使用 `Kubernetes` 部署服务的方式进行安装。首先下载配置文件：

```js 
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```
>如果下载不了，手动访问当前文件直接通过linux命令创建复制也可以

使用 kubectl apply 命令加载下服务。

```js
kubectl apply -f kube-flannel.yml
```

在大约稍后1分钟左右，我们可以使用 `kubectl get nodes` 命令查看节点的运行状态。如果 STATUS = ready，则代表启动成功。

### node节点安装
**在安装 Node 节点前，我们仍然需要操作一遍上面的k8s以及docker的安装**。 Node 节点的地位则是负责运行服务容器，负责接收调度的。  

首先第一步，还是需要先设置一下 hostname 为 node1 。在 node 机器上执行：

```js 
hostnamectl set-hostname node1
```

#### 拷贝 Master 节点配置文件
接着将 master 节点的配置文件拷贝 k8s 到 node 节点。回到在 master 节点，使用 scp 命令通过 SSH传送文件：

```js 
scp $HOME/.kube/config root@node的ip:~/
```
随后在 node 节点执行以下命令，归档配置文件：

```js 
mkdir -p $HOME/.kube
sudo mv $HOME/config $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
> 我是直接复制文件直接拷贝到.kube/config目录下的，省事。

#### 加入 Master 节点
我们直接使用刚才在 master 生成的节点加入命令，在 node 机器上执行。让 Node 节点加入到 master 集群内：

> 这是一条是示例命令！！！！！！

```js 
kubeadm join 172.16.81.164:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:b4a059eeffa2e52f2eea7a5d592be10c994c7715c17bda57bbc3757d4f13903d
```
如果刚才的命令丢了，可以在 master 机器上使用 `kubeadm token create` 重新生成一条命令：


```js 
kubeadm token create --print-join-command
```
遇到的坑：

1. 在这一步的时候发现老是执行不成功，错误提示为： 

```js 

[kubelet-check] It seems like the kubelet isn't running or healthy.
[kubelet-check] The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get http://localhost:10248/healthz: dial tcp 127.0.0.1:10248: connect: connection refused.
[kubelet-check] It seems like the kubelet isn't running or healthy.
[kubelet-check] The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get http://localhost:10248/healthz: dial tcp 127.0.0.1:10248: connect: connection refused.
[kubelet-check] It seems like the kubelet isn't running or healthy.
[kubelet-check] The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get http://localhost:10248/healthz: dial tcp 127.0.0.1:10248: connect: connection refused.
[kubelet-check] It seems like the kubelet isn't running or healthy.

```
然后看了一下`kubelet`的状态,一直都是`auto-restart`的状态。**其实上面打印的所有日志都是不准确的，正确的日志应该执行`journalctl -xefu kubelet`**,复制出来直接搜索`fail`：

```js 
Jan 25 15:12:27 node1 kubelet[15008]: I0125 15:12:27.637534   15008 docker_service.go:260] Docker Info: &{ID:LYCG:AI4B:H5ZM:PEKY:3G6T:SAIE:FDZZ:LWVJ:CL7L:2QP2:MI6T:QI65 Containers:23 ContainersRunning:21 ContainersPaused:0 ContainersStopped:2 Images:43 Driver:overlay2 DriverStatus:[[Backing Filesystem extfs] [Supports d_type true] [Native Overlay Diff true]] SystemStatus:[] Plugins:{Volume:[local] Network:[bridge host ipvlan macvlan null overlay] Authorization:[] Log:[awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog]} MemoryLimit:true SwapLimit:true KernelMemory:true KernelMemoryTCP:true CPUCfsPeriod:true CPUCfsQuota:true CPUShares:true CPUSet:true PidsLimit:true IPv4Forwarding:true BridgeNfIptables:true BridgeNfIP6tables:true Debug:false NFd:195 OomKillDisable:true NGoroutines:178 SystemTime:2021-01-25T15:12:27.630677304+08:00 LoggingDriver:json-file CgroupDriver:systemd NEventsListener:1 KernelVersion:3.10.0-1127.13.1.el7.x86_64 OperatingSystem:CentOS Linux 7 (Core) OSType:linux Architecture:x86_64 IndexServerAddress:https://index.docker.io/v1/ RegistryConfig:0xc0009500e0 NCPU:2 MemTotal:3973308416 GenericResources:[] DockerRootDir:/var/lib/docker HTTPProxy: HTTPSProxy: NoProxy: Name:node1 Labels:[] ExperimentalBuild:false ServerVersion:19.03.12 ClusterStore: ClusterAdvertise: Runtimes:map[runc:{Path:runc Args:[]}] DefaultRuntime:runc Swarm:{NodeID: NodeAddr: LocalNodeState:inactive ControlAvailable:false Error: RemoteManagers:[] Nodes:0 Managers:0 Cluster:<nil> Warnings:[]} LiveRestoreEnabled:false Isolation: InitBinary:docker-init ContainerdCommit:{ID:7ad184331fa3e55e52b890ea95e65ba581ae3429 Expected:7ad184331fa3e55e52b890ea95e65ba581ae3429} RuncCommit:{ID:dc9208a3303feef5b3839f4323d9beb36df0a9dd Expected:dc9208a3303feef5b3839f4323d9beb36df0a9dd} InitCommit:{ID:fec3683 Expected:fec3683} SecurityOptions:[name=seccomp,profile=default] ProductLicense: Warnings:[]}
Jan 25 15:12:27 node1 kubelet[15008]: F0125 15:12:27.637637   15008 server.go:269] failed to run Kubelet: misconfiguration: kubelet cgroup driver: "cgroupfs" is different from docker cgroup driver: "systemd"
```
终于发现了真正的错误:`failed to run Kubelet: misconfiguration: kubelet cgroup driver: "cgroupfs" is different from docker cgroup driver: "systemd"`。说的是k8s的 `cgroup driver` 跟docker的设置不匹配。  

查找一系列谷歌之后发现以前抄dokcer配置的时候抄出问题了:
```js 
{
   # 这一步设置了systememd
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "data-root": "/data/docker"
}
```

然后网上各种这个设置那个设置，后面我学乖了**直接删剩`registry-mirrors`就可以了**

```js 
{
  "registry-mirrors": [
    "https://n70lvc70.mirror.aliyuncs.com",
    "https://dockerhub.azk8s.cn",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```
2. 节点不处于同一个内网环境下
因为我的一台机器是阿里云的服务器，master节点是腾讯云的机器。并不处于同一个内网环境中。这时候需要做映射。
如果node节点跟master节点不处于同一个内网环境下，也就是说node节点ping不通master节点的内网ip。那么在加入master节点的时候会报一下错误：

```js
	[WARNING Hostname]: hostname "node2" could not be reached
	[WARNING Hostname]: hostname "node2": lookup node2 on 100.100.2.138:53: no such host
```
解决方案：在node服务器上执行如下语句:

```js
iptables -t nat -A OUTPUT -d [master节点内网ip，也就是kubeadm join xxx对应的ip] -j DNAT --to-destination [master节点外网ip]
```

## 使用nfs挂载

### 购买腾讯云nfs服务
这里跑到腾讯云官网自行购买nfs服务`https://console.cloud.tencent.com/cfs/overview`,在需要使用到nfs服务的节点安装`nfs-utils`。推荐所有节点都安装上

`https://cloud.tencent.com/document/product/582/11523`  

创建目录

```js 
mkdir k8s-blog-nfs
```

挂载
```js 
sudo mount -t nfs -o vers=4.0,noresvport xxx:/ /k8s-blog-nfs
```

注意这里的命令行意思是指腾讯云的nfs根地址挂载到当前机器的`/k8s-blog-nfs`文件夹上。  

所以`/k8s-blog-nfs/mysql`映射的是nfs地址的`/mysql`地址 注意的是pvc中的nfs地址不能设置根路径，必须设置为`/mysql`类似的子目录。

### 一些常用到的指令

1. `kubectl get [pod namespace pvc pv] -n 【name-space】/ --all-namespaces`  
获取一些常用的pod namespace等等列表

2. `journalctl -xefu kubelet`  
用于获取调试的日志，一般启动的错误提示不清晰建议直接使用这个

3. `kubectl apply -f / kubectl delete -f`
启动或者停止相关的k8s配置

4. `kubectl logs [pod] -n xxx`
查看pod启动日志