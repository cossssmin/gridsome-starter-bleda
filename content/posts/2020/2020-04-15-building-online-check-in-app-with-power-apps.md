---
title: "[COVID-19 Series #3] Building Students' Check-in App with Power Apps, Azure Functions and Azure Face API"
slug: building-online-check-in-app-with-power-apps
description: "This post shows how to build a Power App to help teachers run online check-in, using Azure Functions and Face API."
date: "2020-04-15"
author: Justin-Yoo
tags:
- power-apps
- azure-functions
- face-api
- covid-19
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-00.png
fullscreen: true
---

> This is the third (and the last) post of the series to let teachers and lecturers build an online students' check-in app, using [Power Apps][powapp], [Azure Functions][az func], and [Azure Face API][az cog faceapi].

1. [Capturing Face Images from Browser to Azure Blob Storage via Azure Functions][post series 1]
2. [Identifying Students' Face with Azure Functions and Azure Face API][post series 2]
3. **Building Students' Check-in App with Power Apps, Azure Functions and Azure Face API**

---

In my [previous post][post series 2], I walked through how to take faces from a webcam, using [Azure Functions][az func] and upload them to [Azure Blob Storage][az st blob]. In this post, let's figure out how to identify faces using [Azure Face API][az cog faceapi].

> The sample code used in this post can be downloaded from [Azure Functions Face Recognition Sample][gh sample].

## The Workflow ##

Here's the simplified workflow for this post, which is the same one in the [previous post][post series 2]. The only difference here is that we use [Power App][powapp], instead of a web page.

![][image-01]

Due to this difference, the API request/response structure needs to be updated in the following ways.


## Restructuring API Request/Response Payloads ##

From my [previous][post series 1] [posts][post series 2], the request data only contains embedded image data. But for [Power Apps][powapp], as it's online check-in app that many students use, the students' name should be included in the payload. Therefore, the request payload has been revised like:

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=01-embedded-request.cs

In addition to this, the response payload also needs to be converted into a JSON object like following. For convenience, I intentionally included the constructor, which is optional.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=02-result-response.cs

All the rest of the [Azure Functions][az func] app hasn't been changed. It's all working now.

![][image-02]


## Creating Custom Connector ##

Now, we've got the [Azure Functions][az func] API ready in the cloud. However, in order to use the API in [Power Apps][powapp], we need to do one more thing &ndash; a [custom connector][powapp cuscon]. As I mentioned in my [another post][post navermapapi], direct API access from [Power Apps][powapp] is not less intuitive than expected. I think it's by design to keep the philosophy of "low-code" and "no-code". Hence, the [custom connector][powapp cuscon] is the answer to sort out this issue. Through the [custom connector][powapp cuscon], the [Power Apps][powapp] calls the API and gets the result from there. The more bright side of using the [custom connector][powapp cuscon] is reusability. It's reusable for [Logic Apps][az logapp] and [Power Automate][powflow].

If an API app has implemented [Open API spec][openapi spec], creating a [custom connector][powapp cuscon] is [really easy][powapp cuscon openapi]. But unfortunately, the API used in this series hasn't implemented it because:

1. Only the [Azure Functions][az func] runtime version is 1.x officially supports [Open API][az func openapi].
2. There is a workaround by [manually uploading a `swagger.json` file and rendering it][post openapi 1].
3. There is another workaround by using a [NuGet package][az func openapi nuget] and [implementing it][post openapi 2].

However, none of the above applies to the API in this series. Therefore, we need to create the [custom connector][powapp cuscon] [from scratch][powapp cuscon scratch]. Let's start.

Login to Power App page and click the `Custom Connectors` menu.

![][image-03]

Click the `+ New custom connector` button and select `Create from blank`.

![][image-04]

The first thing we're going to do is to give the connector a name. I use `FaceIdentifier`.

![][image-05]

If you're familiar with authoring the Open API definition doc, you can choose the `Swagger Editor` at the top. For now, we're using the UI form. First of all, select the `HTTPS` protocol and URL of the [Azure Functions][az func]. Put `/api` in the `Base URL` field. Then, click the `Security` button to proceed.

![][image-06]

In this screen, we're setting up authentication. Each endpoint of an [Azure Function] app has its unique access key. So, choose the `API Key` option for the authentication type, enter `authkey` for the parameter label, `x-functions-key` for the parameter name, and choose `Header` for parameter location. Then click the `Definition` button to proceed.

![][image-07]

Let's define the operation and data structure. Click the `New action` button at the left and give a name to the `Operation ID`. I use `Identify` for it. Then click the `+ Import from the sample` under the Request section.

![][image-08]

We use the `POST` method, and its URL is `/faces/identify`. The JSON payload consists of two fields, `personGroup` of string type and `image` of string type. We don't need the real value here. Then click the `Import` button to finish.

![][image-09]

Now, we got the request data defined.

![][image-10]

Let's define the response data format. Click the `default` data.

![][image-11]

The default response defines the HTTP Status Code of `200 (OK)`. Its body has the `key-body-output` field, but ignore this for now. Give it a name `200` and click the `+ Import from sample` button.

![][image-12]

As we defined above, the response JSON looks like below. Then click the `Import` button to finish.

![][image-13]

Now, the `key-body-output` has gone, and both `statusCode` and `message` fields have appeared.

![][image-14]

We've completed the [custom connector][powapp cuscon] definition. Click the `✅ Create connector` button to save it.

Let's test the connector. Click the `Test` button at the bottom right to proceed and click the `+ New connection` button.

![][image-15]

As mentioned earlier, each endpoint of [Azure Functions][az func] API has its unique access key. Use this key or host key that is applicable to the entire endpoints.

![][image-16]

Once authenticated, run the test with data to verify the connector.

![][image-17]

We've got the [custom connector][powapp cuscon] ready! Let's build the [Power App][powapp].


## Building Power App ##

At the homepage of [Power App][powapp], click `Canvas app from blank`.

![][image-18]

Give the name to the app, `SchoolCheckIn` for example. The format can be either `Tablet` or `Phone`. I chose `Phone`.

![][image-19]

We got the empty canvas ready. Let's put some controls on it. From the top, [Camera][powapp control camera], [Toggle][powapp control toggle], Two [Buttons][powapp control button], [Label][powapp control label], and [Image][powapp control image] controls are placed.

![][image-20]

Register the custom connector that we created above. From the Data Sources menu at the left, we can find out the `FaceIdentifier` connector.

![][image-21]

It's registered to my app and available to use.

![][image-22]

Let's handle the controls one by one.


### Toggle Control ###

Through the [Toggle][powapp control toggle] control, we decide to use either the front-facing camera or rear-facing one. Phones nowadays have two cameras. iPhone, for example, takes `0` for the rear camera and `1` for the front camera. Therefore, enter the following formula into the `OnCheck` field.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=03-toggle-oncheck.vb

And another formula for the `OnUncheck` field.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=04-toggle-onuncheck.vb

The `cameraId` is a collection. The [`ClearCollect()`][powapp func clearcollect] function clears the collection then fill a new value into it. As there's no concept of "defining variables" in [Power Apps][powapp], every collection and variable are created and disposed of implicitly. The `cameraId` collection also follows the same rule. We just use it.

![][image-23]


### Camera Control ###

Let's adjust both `Camera` and `StreamRate` fields in the [Camera][powapp control camera] control. Put the minimum value of `100` to `StreamRate`, which is the refresh rate for every 100ms. Then enter the following formula into the `Camera` field.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=05-camera-camera.vb

![][image-24]

Once completed, depending on the value from the [Toggle][powapp control toggle] control, either front-/rear-facing camera is selected. Let's test it.

![][image-25]


### Button Control ###

There are two [Button][powapp control button] controls in this app. First, take a look at the "Reset" button. Enter the formula into the `OnSelect` field.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=06-button-reset-onselect.vb

With the [`ClearCollect()`][powapp func clearcollect] function, both `identified` and `captured` collections are initialised. They are used for [Label][powapp control label] and [Image][powapp control image] controls respectively.

![][image-26]

Let's have a look at the "Identify!" button. It uses the following formula on its `OnSelect` field. This is the core part of this app, actually.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=07-button-identify-onselect.vb

Hmmm, looks a bit complicating. 🤔

* The `captured` collection is refreshed with the `Stream` value from the [Camera][powapp control camera] control. This collection will pass the image data to the [Image][powapp control image] control.
* The `identified` collection stores the API request result from the custom connector, `FaceIdentifier`, using its `Identify()` operation.
* The `FaceIdentifier.Identify()` operation requires both `personGroup` and `image` values from the control.
  * `personGroup` is hard-coded for now, but it should be the real value from individual student's identity.
  * The `Stream` field of [Camera][powapp control camera] is interesting. To use the `Stream` value for API request, we have to use the [`JSON()`][powapp func json] function to convert it to a JSON-ised string. But, as the converted string is wrapped with double-quotes ("), we should also [`Substitute()`][powapp func substitute] function to remove the quotes. For the quote escaping, we again use the double-quotation mark (`""""`).

Don't you feel as if you're using an Excel spreadsheet? At least I do. Even the function usage pretty closes to it.

![][image-27]


### Label Control ###

This [Label][powapp control label] control displays the verification result from the API call. The `identified` is responsible for it. The response object from the API call contains the `message` field, so we pass the value to the `Text` field like:

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=08-label-text.vb

![][image-28]

Did you notice that we put `{ message: "" }` on the "Reset" button when we initialise the `identified` collection? Here's why.


### Image Control ###

In the [Image][powapp control image] control, let's put the following formula into the `Image` field. The `Url` comes from the `captured` collection.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=09-image-image.vb

![][image-29]


## Testing Power Apps ##

Apparently, we've built the brand-new app! How simple is that? Let's try in my local machine before publishing. On Windows, click the button with your mouse while pushing down the `ALT` key. For mac, use the `OPTION` key instead. Everything works as expected like below:

![][image-30]


## Publishing Power App ##

When you're comfortable for the app, let's publish. Once published, it appears on your mobile app. Run the app on your mobile!

https://youtu.be/GVNK8HcF-xY

---

So far, we've used [Power Apps][powapp], [Azure Functions][az func] and [Azure Face API][az cog faceapi] to build an app for online attendance check-in. Power Apps is often called as "low-code" or "no-code" app builder, as we barely used codes for the app building. All the data exchange is done through connectors. Of course, we need codes for the API app, but this is outside the scope of Power Apps. Therefore, once API is ready for use, Power Apps simply consumes it to build apps, which comes really handy. It's time for you to develop your own app!


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-01-en.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-06.png
[image-07]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-07.png
[image-08]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-08.png
[image-09]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-09.png
[image-10]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-10.png
[image-11]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-11.png
[image-12]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-12.png
[image-13]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-13.png
[image-14]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-14.png
[image-15]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-15.png
[image-16]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-16.png
[image-17]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-17.png
[image-18]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-18.png
[image-19]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-19.png
[image-20]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-20.png
[image-21]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-21.png
[image-22]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-22.png
[image-23]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-23.png
[image-24]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-24.png
[image-25]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-25.png
[image-26]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-26.png
[image-27]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-27.png
[image-28]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-28.png
[image-29]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-29.png
[image-30]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-online-check-in-app-with-power-apps-30.png

[post series 1]: /2020/04/01/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions/
[post series 2]: /2020/04/08/identifying-faces-through-azure-functions-using-face-api/
[post navermapapi]: /2020/03/18/building-powerapp-with-naver-map-api/
[post openapi 1]: /2019/01/04/rendering-swagger-definitions-through-azure-functions-v2/
[post openapi 2]: /2019/02/02/introducing-swagger-ui-on-azure-functions/

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/tree/part-3

[openapi spec]: http://spec.openapis.org/oas/v2.0

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func openapi]: https://docs.microsoft.com/azure/azure-functions/functions-api-definition?WT.mc_id=devkimchicom-blog-juyoo
[az func openapi nuget]: https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/

[az logapp]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/azure/cognitive-services/face/overview?WT.mc_id=devkimchicom-blog-juyoo

[az st blob]: https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo

[powapp]: https://powerapps.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[powapp cuscon]: https://docs.microsoft.com/connectors/custom-connectors/use-custom-connector-powerapps?WT.mc_id=devkimchicom-blog-juyoo
[powapp cuscon openapi]: https://docs.microsoft.com/connectors/custom-connectors/define-openapi-definition?WT.mc_id=devkimchicom-blog-juyoo
[powapp cuscon scratch]: https://docs.microsoft.com/connectors/custom-connectors/define-blank?WT.mc_id=devkimchicom-blog-juyoo

[powapp control camera]: https://docs.microsoft.com/powerapps/maker/canvas-apps/controls/control-camera?WT.mc_id=devkimchicom-blog-juyoo
[powapp control image]: https://docs.microsoft.com/powerapps/maker/canvas-apps/controls/control-image?WT.mc_id=devkimchicom-blog-juyoo
[powapp control toggle]: https://docs.microsoft.com/powerapps/maker/canvas-apps/controls/control-toggle?WT.mc_id=devkimchicom-blog-juyoo
[powapp control button]: https://docs.microsoft.com/powerapps/maker/canvas-apps/controls/control-button?WT.mc_id=devkimchicom-blog-juyoo
[powapp control label]: https://docs.microsoft.com/powerapps/maker/canvas-apps/controls/control-text-box?WT.mc_id=devkimchicom-blog-juyoo

[powapp func clearcollect]: https://docs.microsoft.com/powerapps/maker/canvas-apps/functions/function-clear-collect-clearcollect?WT.mc_id=devkimchicom-blog-juyoo
[powapp func json]: https://docs.microsoft.com/powerapps/maker/canvas-apps/functions/function-json?WT.mc_id=devkimchicom-blog-juyoo
[powapp func substitute]: https://docs.microsoft.com/powerapps/maker/canvas-apps/functions/function-replace-substitute?WT.mc_id=devkimchicom-blog-juyoo

[powflow]: https://flow.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
