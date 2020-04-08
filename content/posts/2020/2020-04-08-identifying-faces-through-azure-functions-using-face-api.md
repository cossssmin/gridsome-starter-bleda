---
title: "[COVID-19 Series #2] Identifying Students' Face with Azure Functions and Azure Face API"
slug: identifying-faces-through-azure-functions-using-face-api
description: "This post shows how to identify faces captured from the web page, using Azure Functions and Azure Face API."
date: "2020-04-08"
author: Justin-Yoo
tags:
- azure-functions
- face-api
- azure-blob-storage
- azure-table-storage
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-00.png
fullscreen: true
---

> This is the second post of the series to let teachers and lecturers build an online students' check-in app, using [Power Apps][power apps], [Azure Functions][az func], and [Azure Face API][az cog faceapi].

1. [Capturing Face Images from Browser to Azure Blob Storage via Azure Functions][post series 1]
2. **Identifying Students' Face with Azure Functions and Azure Face API**
3. Building Students' Check-in App with Power Apps, Azure Functions and Azure Face API

---

In my [previous post][post series 1], I walked through how to take faces from a webcam, using [Azure Functions][az func] and upload them to [Azure Blob Storage][az st blob]. In this post, let's figure out how to identify faces using [Azure Face API][az cog faceapi].

> The sample code used in this post can be downloaded from [Azure Functions Face Recognition Sample][gh sample].


## The Workflow ##

Here's the simplified workflow for this post:

![][image-01]

We've got both "Receive Face Image" and "Upload Face Image" actions implemented at the [previous post][post series 1]. We're going to put a checking logic ("Got Enough Face Images?") in the middle, and add "Train Face Images" and "Identify Face Image" actions and the check logic of "Face Identified?". Let's start.


## Environment Variables ##

Here are the environment variables used in this function app.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=00-environment-variables.cs

As they are frequently used in the code snippet below, keep them in mind.


## Got Enough Face Images? ##

The value of `Blob__NumberOfPhotos` sets the number of face images required for face identification. The larger number it is, the more accurate the face identification result is. But on the flip side, it takes longer if the number gets bigger. Here in this post, I set the value to `6`. Therefore, the function app only picks up six images from [Azure Blob Storage][az st blob] in a random way (line #6). Here's the logic:

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=01-get-images.cs&highlights=6,15

Once you run the function app at this point, you will be only able to see the message like this, until you have enough number of photos (line #15).

![][image-02]

The code above will randomly take as many photos as the number, from the [Azure Blob Storage][az st blob]. If there are not enough photos, it will return the message to store more photos. By the way, where's the randomising logic? Well, the filename is GUID which is random enough. Those images taken from the [Blob Storage][az st blob] will be used as a control group. Let's look at the code below. When a new face image is taken, and there are more faces in the photo, it won't be able to use (line #11).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=02-detect-face.cs&highlights=11

The code above sends the face image to [Face API][az cog faceapi] to check whether there is only one face or not. As the [Blob Storage][az st blob] is not accessible from the public, a [SAS token][az st blob sas] **MUST** be appended to get the image. The token value comes from the environment variable of `Blob__SasToken`. If there is no face or more than one face detected in the photo, it's not appropriate to use for the face identification. Therefore, it's rejected with the `Bad Request` status code.

![][image-03]


## Train Face Images ##

Now, we've got enough number of face images and one for the identification. It's time to train the randomly chosen face images as a control group. The code below shows the preparation for the training.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-1.cs&highlights=8-9

As we use [Azure Table Storage][az st table] to log identification history, a new record has been added (line #8-9). The `FaceEntity` is involved in the overall process for face identification. The `FaceEntity` instance stores both `personGroup` and `personGroupId` values.

Let's see the code below. To identify the face, we need to create a `PersonGroup` (line #4-6) and `Person` inside it (line #8-10). Here's the code:

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-2.cs&highlights=4-6,8-10

The face images as a control group are uploaded to `Person` (line #9-11). The face images used for the control group is stored in the `FaceIds` property.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-3.cs&highlights=9-11

It's ready for the training. Run the `TrainAsync()` method (line #4-6).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-4.cs&highlights=4-6,11-13

As it takes time until the training is over, the `while { ... }` loop is useful to check the training result (line #11-13). Finally, the training is over. It's time to compare the new face picture to the control group.


## Identify Face Image ##

The new face image for the identification **MUST** also be detected whether there is only one face exists or not. Once this process is over, the face is compared to the control group (line #7-9).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=04-identify-face.cs&highlights=7-9

The `Confidence` value is the result of face identification. If this value is `1`, it's the identical face, if `0`, it's entirely a different face.


## Face Identified? ##

We've also got the environment variable of `Face__Confidence`, which contains a threshold value. If the `Confidence` result is higher than the `Face__Confidence` value, the face is considered as "identified". The code below handles the confidence value.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=05-confirm-identification.cs

Here are the result of both "Success" and "Fail".

![][image-04]
![][image-05]

Once everything is done, the final result of `FaceEntity` is updated on the [Azure Table Storage][az st table]. The `Confidence` column in the table stores the face identification result, and `FaceIds` shows the list of control images.

![][image-06]

---

So far, we've walked through how to identify my face through [Azure Functions][az func] and [Azure Face API][az cog faceapi]. In fact, the algorithm for face identification is really hard to understand. However, the Face API is a fully managed service that we don't have to maintain &ndash; this is the key concept of this post. In the next post, as the final post of this series, I'll build a [Power App][power apps] to integrate the [Function][az func] app.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-01-en.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/identifying-faces-through-azure-functions-using-face-api-06.png

[post series 1]: /2020/04/01/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions/

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/tree/part-2
[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo

[az st blob]: https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo
[az st blob sas]: https://docs.microsoft.com/azure/storage/common/storage-sas-overview?WT.mc_id=devkimchicom-blog-juyoo
[az st table]: https://docs.microsoft.com/azure/storage/tables/table-storage-overview?WT.mc_id=devkimchicom-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/azure/cognitive-services/face/overview?WT.mc_id=devkimchicom-blog-juyoo

[power apps]: https://powerapps.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
