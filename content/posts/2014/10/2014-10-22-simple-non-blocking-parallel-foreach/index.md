---
title: "초간단 병렬처리 Parallel ForEach 문"
date: "2014-10-22"
slug: simple-non-blocking-parallel-foreach
description: ""
author: Justin-Yoo
tags:
- dotnet
- ForEach
- Parallel
fullscreen: false
cover: ""
---

배치작업을 할 때 쓰일 수 있는 상당히 간단하고 유용한 코드 스니펫입니다.

```csharp
public static class Extensions
{
    public static void ParallelForEach<T>(this List<T> list, Action<T> action)
    {
        list.ForEach(item => new Thread(() => action(item)).Start());
    }
}
```

위의 익스텐션 메소드는 아래와 같은 상황에서 쓰일 수 있습니다:

```csharp
var inputs = new List<string>()
                 {
                     "abc.csv",
                     "xyz.csv",
                 };

inputs.ParallelForEach(path => ProcessBatchFile(path));

// ProcessBatchFile 메소드는 이미 정의되어 있다고 가정합니다
```
