---
title: "C# Coding Guidelines"
date: "2014-03-12"
slug: csharp-coding-guidelines
description: ""
author: Justin-Yoo
tags:
- dotnet
- csharp
- coding-guidelines
fullscreen: false
cover: ""
---

## About the Guidelines

The guidelines provide a practical way of developing .NET applications using C# 3.0 or later depending on versions that applications are using. The existing coding guidelines that **Aliencube** have been using were originally written in 2003 by [Mike Kruger](http://www.icsharpcode.net/technotes/sharpdevelopcodingstyle03.pdf). Many development environments, however, have a lot been evolved from that point of time. This document is based on [Dennis Doomen](http://www.dennisdoomen.net)'s [C# Coding Guidelines](http://csharpguidelines.codeplex.com) released on [Nov 26th, 2012](http://csharpguidelines.codeplex.com/releases/view/98254).

## History

Since Doomen's original document was written in MS-Word and released in PDF, which is hard to be maintainable, I made a decision to use plain markdown format for easy maintenance under the same license he originally set up. In addition to that, I got a permission to translate this into Korean, which will be provided soon.

## Rationale

Coding guidelines are sometimes overlooked since they are considered as putting some unwanted burdens on developers. However, it has already been proved to worth doing because not all developers:

- are aware that code is generally read 10 times more than it is changed;
- are aware of the potential pitfalls of certain constructions in C#;
- are introduced into certain conventions when using the .NET Framework such as `IDisposable` or the deferred execution nature of LINQ;
- are aware of the impact of using (or neglecting to use) particular solutions on aspects like security, performance, multi-language support, etc; and
- know that not every developer is as capable of understanding an elegant, but abstract, solution as the original developer.

## Basic Principles

In general, because this document cannot cover everything for each application's purpose, those two documents provided by Microsoft are the main starting points:

- [C# Coding Conventions (C# Programming Guide)](http://msdn.microsoft.com/en-us/library/ff926074.aspx)
- [Framework Design Guidelines](http://msdn.microsoft.com/en-us/library/ms229042.aspx)

Those principles have already been applied to Visual Studio. So, using the default settings can check most of our coding conventions. [ReSharper](http://www.jetbrains.com/resharper) that we are using checks our code in a more robust way so following its default settings would be more efficient.

In addition to them, this document provides guidelines with the following principles:

- **The Principle of Least Surprise** (or Astonishment) – you should choose a solution that does include any things people might not understand, or put on the wrong track.
- **Keep It Simple Stupid** (KISS) – the simplest solution is more than sufficient.
- **You Ain't Gonna Need It** (YAGNI) – you should create a solution for the current problem rather than the ones you think will happen later on (since when can you predict the future?).
- **Don't Repeat Yourself** (DRY) – you are encouraged to prevent duplication in your code base without forgetting the [Rule of Three](http://lostechies.com/derickbailey/2012/10/31/abstraction-the-rule-of-three) heuristic.

## How to Apply

Developers are not forced to comply with this guidelines. However, they are encouraged to apply those guidelines. Each guideline is clearly labeled like:

- ![MUST](https://raw.github.com/aliencube/CSharp-Coding-Guidelines/master/imgs/must.png): This guideline must be considered for coding.
- ![SHOULD](https://raw.github.com/aliencube/CSharp-Coding-Guidelines/master/imgs/should.png): This guideline is strongly recommended for coding.
- ![MAY](https://raw.github.com/aliencube/CSharp-Coding-Guidelines/master/imgs/may.png): This guideline can be applied for coding.

![NOTE](https://raw.github.com/aliencube/CSharp-Coding-Guidelines/master/imgs/note.png) The terms – `must`, `should` and `may` – are defined in [RFC 2119](http://www.ietf.org/rfc/rfc2119.txt)

## Useful Resources

In addition to the many links provided throughout this document, the following books, articles and sites for everyone interested in software quality are recommended:

- [Code Complete: A Practical Handbook of Software Construction](http://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670) (Steve McConnel)

It deals with all aspects of software development, and even though the book was originally written in 2004, but you'll be surprised when you see how accurate it still is. I wrote a review in 2009 if you want to get a sense of its contents.

- [The Art of Agile Development](http://www.amazon.com/Art-Agile-Development-James-Shore/dp/0596527675) (James Shore)

Another great all-encompassing trip through the many practices preached by processes like Scrum and Extreme Programming. If you're looking for a quick introduction with a pragmatic touch, make sure you read James' book.

- [Applying Domain Driven-Design and Patterns: With Examples in C# and .NET](http://www.amazon.com/Applying-Domain-Driven-Design-Patterns-Examples/dp/0321268202) (Jimmy Nilsson)

The book that started my interest for both Domain Driven Design and Test Driven Development. It's one of those books that I wished I had read a few years earlier. It would have saved me from many mistakes.

- [Jeremy D. Miller's Blog](http://codebetter.com/blogs/jeremy.miller)

Although he is not that active anymore, in the last couple of years he has written some excellent blog posts on Test Driven Development, Design Patterns and design principles. I've learned a lot from his real-life and practical insights.

- [LINQ Framework Design Guidelines](http://blogs.msdn.com/b/mirceat/archive/2008/03/13/linq-framework-design-guidelines.aspx)

A set of rules and recommendations that you should adhere to when creating your own implementations of `IQueryable<T>`.

- [Best Practices for c# `async`/`await`](http://code.jonwagner.com/2012/09/06/best-practices-for-c-asyncawait/)

The rationale and source of several of the new guidelines in this documented, written by [Jon Wagner](https://twitter.com/jonwagnerdotcom).

## Table of Contents

- [Class Design Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Class.Design.Guidelines.md)
- [Member Design Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Member.Design.Guidelines.md)
- [Miscellaneous Design Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Miscellaneous.Design.Guidelines.md)
- [Maintainability Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Maintainability.Guidelines.md)
- [Naming Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Naming.Guidelines.md)
- [Performance Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Performance.Guidelines.md)
- [Framework Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Framework.Guidelines.md)
- [Documentation Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Documentation.Guidelines.md)
- [Layout Guidelines](https://github.com/aliencube/CSharp-Coding-Guidelines/blob/master/Layout.Guidelines.md)

## License

This is released under **New BSD License** as its original distributor does.

> Copyright (c) 2014, aliencube.org All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
> 
> - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
>     
> - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
>     
> - Neither the name of the aliencube.org nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
>     
> 
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
