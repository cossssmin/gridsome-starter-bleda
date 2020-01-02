---
title: "Running Kubernetes CLI on Windows Subsystem for Linux (WSL)"
date: "2018-06-05"
slug: running-kubernetes-on-wsl
description: ""
author: Justin-Yoo
tags:
- azure-container-services
- docker
- kubernetes
- windows
- windows-subsystem-for-linux
- wsl
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-00.png
---

Running Docker on Windows is easy. Running Docker in Windows Subsystem for Linux (WSL) needs some tricks. [Nick Janetakis](https://twitter.com/nickjanetakis) has well written the trick on his [blog post](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly). Now, I want to get [Kubernetes](https://kubernetes.io/) running in WSL. As WSL doesn't support Docker running natively, neither does Kubernetes. But as always, there is a way.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/well-find-a-way-we-always-have.jpg)

In this post, I'm going to walk through how to run Kubernetes in WSL.

## Installing Kubernetes via Docker for Windows - Edge Channel

First of all, we need to install the edge version of [Docker for Windows](https://docs.docker.com/docker-for-windows/). Go to `settings > general` then you will be able to see the current version running.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-01.png)

I have already installed the Edge version, so it shows my Docker for Windows is running the Edge version of it. Click the link in the red box.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-02.png)

And select the Edge channel. Then the Edge version will be installed. Once installed, another menu will be appearing – Kubernetes. Click the menu.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-03.png)

Kubernetes is not activated. Select the tick box and choose Kubernetes as an orchestration tool. Then click the `Apply` button for install.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-04.png)

Kubernetes has been installed and it's now up and running.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-05.png)

In order to check whether Kubernetes is running on Windows, enter the following command:

```bat
kubectl cluster-info

```

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-06.png)

Now it's all done in the Windows side. Let's make that Kubernetes up and running in WSL.

## Installing Kubernetes CLI in WSL

We have Kubernetes cluster working outside WSL. In order to get Kubernetes working in WSL, we need to [install `kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/) in WSL. In the bash screen, run the following command.

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
&& chmod +x ./kubectl \
&& sudo mv ./kubectl /usr/local/bin/kubectl

```

`kubectl` has been installed.

## Copying Kubernetes Config from Windows

Even though `kubectl` has been installed, we can't use this until configuration is copied over. Enter the following command in the Bash prompt.

```bash
mkdir ~/.kube \
&& cp /mnt/c/Users/[USERNAME]/.kube/config ~/.kube

```

> If you have already completed [this](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly), you don't need `/mnt` bit any longer. Just use `/c/Users/...` instead.

And let `kubectl` know to use the Docker for Windows context.

```bash
kubectl config use-context docker-for-desktop

```

Now, `kubectl` in WSL should be working as expected. Enter the following command.

```bash
kubectl cluster-info

```

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-07.png)

## Deploying App to Kubernetes Cluster from WSL

Now, `kubectl` is basically up and running. But we need to make sure if it actually gets the deployment, service and pod running or not. Enter the command below:

```bash
kubectl run hello-minikube --image k8s.gcr.io/echoserver:1.10 --port 8080
kubectl expose deployment hello-minikube --type NodePort

```

Now the `hello-minikube` app is up and running. Run the following command to get the service port.

```bash
kubectl describe service hello-minikube

```

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-08.png)

It says the service is open through the port number `32045`. Open a web browser and access to the website.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/running-kubernetes-on-wsl-09.png)

We can see the website is up and running.

* * *

So far, we have walked through how to install and run Kubernetes in WSL. It doesn't require [`minikube`](https://kubernetes.io/docs/tasks/tools/install-minikube/) any longer, which is much easier. I'm learning Docker and Kubernetes, and this will speed up my learning experiences.

> If you still want to use `minikube`, you can follow [Dario De Bastiani](https://twitter.com/ddbastiani)'s post, [Install kubernetes on windows + WSL](https://medium.com/@ddebastiani/install-kubernetes-on-windows-wsl-c36f6b2571d2).
