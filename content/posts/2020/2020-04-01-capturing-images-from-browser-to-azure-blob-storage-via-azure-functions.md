---
title: "[COVID-19 Series #1] Capturing Face Images from Browser to Azure Blob Storage via Azure Functions"
slug: capturing-images-from-browser-to-azure-blob-storage-via-azure-functions
description: "This post shows how to capture face image on a web browser and save it to Azure Blob Storage through Azure Functions."
date: "2020-04-01"
author: Justin-Yoo
tags:
- azure-functions
- html-media-capture
- azure-blob-storage
- face-api
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-00.png
fullscreen: true
---

> This is the first post of the series to let teachers and lecturers build an online students' check-in app, using [Power Apps][power apps], [Azure Functions][az func], and [Azure Face API][az cog faceapi].

1. **Capturing Face Images from Browser to Azure Blob Storage via Azure Functions**
2. [Identifying Students' Face with Azure Functions and Azure Face API][post series 2]
3. Building Students' Check-in App with Power Apps, Azure Functions and Azure Face API

---

As the unprecedented COVID-19 pandemic situation has hit all around the world, schools have shut down, companies have closed the door. Therefore, all students and employees are accessing to their organisation's resources remotely, like online lectures or conference calls. There are funny jokes around this situation as well.

![][image-02]

Let's focus on the school's circumstances. Checking students attendance is as vital as other measures. Imagine that a teacher runs an online class and she wants to check all students have attended her class at the beginning. Although there are thousands of ways to sort it out, I'm going to use [Azure Face API][az cog faceapi] to identify students in an app. In this post, I'm going to capture face images from a web browser and save it to [Azure Blob Storage][az storage blob] through [Azure Functions][az func].

> The sample code used in this post can be downloaded from [Azure Functions Face Recognition Sample][gh sample].


## Capturing Faces on Web Browser ##

Your modern web browsers support [Media Capture API][mdn media capture] so that we can easily take photos using a web cam. This API uses the [`getUserMedia()`][mdn getusermedia] function. Its usage can be found at the [MDN document][mdn getusermedia], but I'm taking a code snippet from the [getUserMedia() tutorial][html5rocks tutorial getusermedia] at [HTML5 Rocks][html5rocks tutorial]. The complete source code is [here][gh photocapture].

This is the HTML part of the web page to access to the camera. We get the input from the webcam from the `video` tag (line #2), take a picture and manipulate the image data on the `canvas` tag (line #4), and send the image data to the `img` tag (line #3).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=01-photo-capture-1.html&highlights=2-4

Here's the JavaScript part of the web page. The `captureVideoButton` function enables the webcam access (line #13-18), and the `screenshotButton` function takes the photo and converts it to the embedded image data (line #20-26).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=02-photo-capture-2.html&highlights=13-18,20-26

The following part is a very simple [jQuery][jq] code that sends the embedded image data to the [Azure Functions][az func] endpoint (line #5-9).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=03-photo-capture-3.html&highlights=5-9

The HTML page above is ready to be rendered. Where should it be? As [Azure Functions][az func] also can render a static HTML page, let's use it now. Here's the function code. There are two notable parts. `ILogger` instance is removed from the method parameters. Instead, the `ExecutionContext` instance comes in. The `ILogger` instance has been moved to the constructor by this [dependency injection][az func di] feature. The `ExecutionContext` instance was added to [trace the execution path][az func executioncontext] of the function instance (line #8). In fact, this `ExecutionContext` instance allows the function endpoint to read the static HTML file, which is rendered through the `ContentResult` instance (line #10-15). Don't forget the content type of `text/html` to render the HTML web page. The whole function endpoint code is [here][gh trigger renderpage].

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=04-render-page-trigger.cs&highlights=8,10-15

Once you complete by this far, you can start running the function app on your local machine. The rendered web page might look like:

![][image-01]

All done! Let's take a picture and store it to [Azure Blob Storage][az storage blob].


## Uploading Embedded Image to Azure Blob Storage ##

The `img` tag in the web page has the `src` attribute value like:

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=05-embedded-image.txt

It's base 64 encoded string, which is the embedded image data. This value has been carried to the [Azure Functions][az func], and the function should convert the encoded image data to binary for [Azure Blob Storage][az storage blob]. Please note that the embedded image data contains the header value at the beginning, like `data:image/png;base64`, followed by the base 64 encoded image. Therefore, to handle the binary data, the header MUST be removed. It's a simple string manipulation process.

First of all, read all the data from the web page (line #10), use the `Split()` method to extract the header value from the payload. The `,` delimiter divides the payload into two parts (line #13), and the `:` and `;` delimiters extract the content type (line #14).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=06-photo-capture-trigger.cs&highlights=10,13-14

Then, the base 64 encoded string is converted to a byte array, which is uploaded to [Azure Blob Storage][az storage blob] through the `UploadByteArrayAsync()` method (line #9). The code below is not the whole for brevity but shows the basic workflow. The full codes can be found at [here][gh trigger photocapture].

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=07-blob-upload.cs&highlights=9

By this far, you can take your face on a web browser and save it to [Azure Blob Storage][az storage blob] at once.

---

So far, as the first step of the blog series, we take a photo on a web browser and save it to [Azure Blob Storage][az storage blob] through [Azure Functions][az func]. The stored images will be used to identify whether my picture is actually me or not. Let's run the face recognition based on the stored faces in the next post.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-02.jpeg

[post series 2]: /2020/04/08/identifying-faces-through-azure-functions-using-face-api

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample
[gh photocapture]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/photo-capture.html
[gh trigger renderpage]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/RenderPageHttpTrigger.cs
[gh trigger photocapture]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/PhotoCaptureHttpTrigger.cs

[mdn media capture]: https://developer.mozilla.org/en/docs/Web/API/Media_Streams_API
[mdn getusermedia]: https://developer.mozilla.org/en/docs/Web/API/MediaDevices/getUserMedia

[html5rocks tutorial]: https://www.html5rocks.com/en/tutorials/
[html5rocks tutorial getusermedia]: https://www.html5rocks.com/en/tutorials/getusermedia/intro/

[jq]: https://jquery.com/

[az logapp]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func di]: https://docs.microsoft.com/azure/azure-functions/functions-dotnet-dependency-injection?WT.mc_id=devkimchicom-blog-juyoo
[az func executioncontext]: https://github.com/Azure/azure-functions-host/wiki/Retrieving-information-about-the-currently-running-function#net-languages-c-f-etc

[az storage blob]: https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/azure/cognitive-services/face/overview?WT.mc_id=devkimchicom-blog-juyoo

[power apps]: https://powerapps.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
