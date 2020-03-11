---
title: "Today I Learnt: About Microsoft Teams Live Events"
slug: today-i-learnt-about-ms-teams-live-event
description: "This post discusses a few checkpoints when you consider MS Teams Live Events streaming."
date: "2020-03-11"
author: Justin-Yoo
tags:
- microsoft-teams
- live-events
- checklists
- til
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/today-i-learnt-about-ms-teams-live-event-00.png
fullscreen: true
---

I ran a [live streaming event][live event] using [Microsoft Teams][ms teams] on last [March 5th][live event announcement] (in Korean). It was a bit of last-minute decision to run the event but, fortunately, as many as 140 attendees watched the live streaming, which I believe it would be a success. I did some research on how to run live event streaming with multiple presenters from their own places. But there's no easy solution. [Microsoft Teams][ms teams] also provides a live streaming feature called [Live Events][ms teams live events]. To me, it's the easiest way with minimal administration efforts. Well, it means that it's relatively easier than the other solutions. Its initial setup was somewhat confusing to me. This post is going to discuss what to check before running [Live Events][ms teams live events] through [Microsoft Teams][ms teams], with different perspectives.


## A Fictitious Scenario ##

> **DISCLAIMER**: All the names of both business and people in this post are fictitious, not the real ones. It will be accidental if those names are really used.

Mallee Bulls Fitness (MBF) is a successful fitness franchise business. They are going to run a live webinar to share some healthy diet with their members and the public. MBF invites a very famous dietitian, Jane Doe, as a guest presenter. How can they run the live streaming event?

* MBF currently uses an Office 365 tenant under the name of `malleebullsfitness.com`.
* Jane uses her email address of `hello@askjanedoe.com`.


## Running Live Events with Microsoft Teams #

I'm not going to discuss this in this post. Instead, please follow this [document][ms teams live events] that explains more than enough. My post will talk about a few points that can be overlooked from each role's perspective.


## Producer's Perspective ##

Are you planning to run the [live event][ms teams live events] what everyone, including outside your organisation, can watch? The event **MUST** be set as "Everyone", which allows the public to be accessible to the live event, without having to log in or providing their identity. If you can't create the event with the "Everyone" option, you should ask the [Microsoft Teams][ms teams] admin to change the policy. The policy can be global or a new one that applies to specific groups or individuals in the organisation.

Jane Doe is a Guest user from the organisation perspective. In order for a Guest user to become a Producer or Presenter at a [live event][ms teams live events], the Guest user account must be registered to the organisation's [Azure Active Directory][aad] tenant beforehand. Only after a producer registers [Jane's email address as a Guest account][ms teams live events planning], she can be a Presenter for the live event streaming.


## Presenter's Perspective ##

Jane may want to share her screen during the live streaming. In that case, she **MUST** use the desktop application. The web browser doesn't support the screen share feature. And she **MUST** login to Teams. If Jane's domain is also another Office 365 tenant, after she logs into Teams, she will be able to see her tenant as a default. She **MUST** change the tenant to MBF; otherwise, she can't be the Presenter. Therefore, the Producer should inform Jane to check her tenant on the Teams app.

Once she finishes the live webinar, she has got two options on her Guest account:

1. **Keep leaving her Guest account on the MBF's tenant**: There's no problem at all. But, the Producer **SHOULD** double-check with their security policy whether it's OK or not. If their security policy doesn't allow it, go to the second option.
2. **Leave MBF's tenant**: The Producer is usually not the AAD admin. In other words, the Producer can't delete Jane's Guest account. Therefore, the Producer **SHOULD** notify the Presenter to leave the tenant by herself, using [this document][aad guest leaving]. The Presenter **SHOULD** visit [Azure Portal][az portal] to delete her account.


## Attendee's Perspective ##

There are not many things to do as an Attendee. They can use both web and app on their PC. But they can't use a web browser on their mobile devices like phones or tablets. If they use the app, they can participate in both chatting and Q&A. But they can't join in the chat when they use their web browsers.


## Recommendations for Producer and Presenter ##

* **Tech Rehearsal**: It's better to run the tech rehearsal before the actual event, with enough time. There are always chances that technical difficulties happen like presenter's machine doesn't fit the live streaming. Permission issues may arise.
* **Final Rehearsal**: Both Producer and Presenter should get together about 30 mins before the live event starts. There's no surprise that anything can happen during the live event. Therefore, the final check is always a good thing.

---

So far, we've discussed several checkpoints about the [live events][ms teams live events] using [Microsoft Teams][ms teams], from the Producers perspective, Presenter's perspective and Attendee's perspective. There may be more issues that I haven't yet experienced. I'll add up them as soon as I find. I hope this post can help organisers planning live events using [Microsoft Teams][ms teams].

[live event]: https://aka.ms/ac/github-actions-in-30-mins/live
[live event announcement]: https://www.facebook.com/events/213280516716653/

[ms teams]: https://products.office.com/microsoft-teams/group-chat-software?WT.mc_id=devkimchicom-blog-juyoo
[ms teams live events]: https://docs.microsoft.com/microsoftteams/teams-live-events/what-are-teams-live-events?WT.mc_id=devkimchicom-blog-juyoo
[ms teams live events planning]: https://docs.microsoft.com/microsoftteams/teams-live-events/plan-for-teams-live-events?WT.mc_id=devkimchicom-blog-juyoo
[ms teams live events setup]: https://docs.microsoft.com/microsoftteams/teams-live-events/set-up-for-teams-live-events?WT.mc_id=devkimchicom-blog-juyoo

[aad]: https://docs.microsoft.com/azure/active-directory/fundamentals/active-directory-whatis?WT.mc_id=devkimchicom-blog-juyoo
[aad guest leaving]: https://docs.microsoft.com/azure/active-directory/b2b/leave-the-organization?WT.mc_id=devkimchicom-blog-juyoo

[az portal]: https://azure.microsoft.com/features/azure-portal/?WT.mc_id=devkimchicom-blog-juyoo
