---
title: "Developing Windows Service with Autofac, Atlas and Quartz.NET"
date: "2014-05-12"
slug: developing-windows-service-with-autofac-atlas-and-quartz-net
description: ""
author: Justin Yoo
tags:
- Windows App Development
- Atlas
- Autofac
- Quartz.NET
- Windows Service
fullscreen: false
cover: ""
---

There are many articles about implementing a scheduled job using [`Autofac`](http://autofac.org) and [`Quartz.NET`](http://www.quartz-scheduler.net) on the Internet. However, they are not quite complete. They just provide some concepts but not actual working example. In general, this post follows [Mark Jourdan](https://twitter.com/markjourdan)'s post, [A quick way to create a windows service using Autofac, Quartz and Atlas](http://www.markjourdan.com/a-quick-way-to-create-a-windows-service-using-autofac-quartz-and-atlas). However, it actually didn't go into how to run method from resolved instances. Here in this post, I'll walkthrough how to develop a Windows Service using [`Autofac`](http://autofac.org), [`Atlas`](http://atlas.codeplex.com) and [`Quartz.NET`](http://www.quartz-scheduler.net) with some corrections of Mark's post. The source code used for this post can be found here:

- [Windows Service with Autofac Atlas & Quartz.NET](https://github.com/aliencube/Windows-Service-with-Autofac-Atlas-Quartz.NET)

## Downloading NuGet Packages

In order for this application to get working, several NeGet package libraries need to be installed before starting.

- `Autofac`: [http://www.nuget.org/packages/Autofac](http://www.nuget.org/packages/Autofac)
- `Atlas`: [http://www.nuget.org/packages/Atlas](http://www.nuget.org/packages/Atlas)
- `Quartz.NET`: [http://www.nuget.org/packages/Quartz](http://www.nuget.org/packages/Quartz)

**NOTE**: At the time of writing this post, the version of `Autofac` is 3.4.0 but `Atlas` only supports up to 3.3.1 version of `Autofac`. Please make sure this.

## Preparing Console Application for `Atlas`

With, `Atlas`, a console application can easily turn into a Windows Service application. So, let's create a console application project into a solution file.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/autofac-atlas-quartz-01.png)

First of all, `App.config` needs to be setup for `Atlas`.

Now, have a look at the following code snippet.

```csharp
internal class Program
{
    private static readonly ILog Log = LogManager.GetCurrentClassLogger();

    static void Main(string\[\] args)
    {
        try
        {
            var configuration = Host.UseAppConfig() // #1
                                    .AllowMultipleInstances()      // #2
                                    .WithRegistrations(p => p.RegisterModule(new SampleModule())); // #3
            if (args != null && args.Any())
                configuration = configuration.WithArguments(args); // #4

            Host.Start(configuration);                             // #5
        }
        catch (Exception ex)
        {
            Log.Fatal("Exception during startup.", ex);
            Console.ReadLine();
        }
    }
} 
```

- `#1`: Let `Atlas` know that `SampleService` is run as a Windows Service.
- `#2`: Let `Atlas` allow to run multiple instances. Comment or remove this, if not necessary.
- `#3`: Register the IoC container built with `Autofac`
- `#4`: Add arguements, if provided.
- `#5`: Start `Atlas`.

Both `#1` and `#3` are the most crucial part of the post. `#1` defines the actual Windows Service to run and `#3` defines IoC container for dependency injection. First comes first. Let's start with `#1`.

## Implementing `SampleService`

`SampleService` must implement the `IAmAHostedProcess` interface to be run on top of `Atlas`. First of all, `App.config` needs `CronExpression` value within the `<appSettings>` element.

This value tells the scheduler to run the job per every 10 seconds. Now, let's implement the `SampleService` class for the actual Windows Service.

```csharp
internal class SampleService : IAmAHostedProcess
{
    private static readonly ILog Log = LogManager.GetCurrentClassLogger();

    public IScheduler Scheduler { get; set; }           // #1

    public IJobFactory JobFactory { get; set; }         // #2

    public IJobListener JobListener { get; set; }       // #3

    public void Start()
    {
        Log.Info("Sample Windows Service starting");

        var job = JobBuilder.Create()
                            .WithIdentity("SampleJob", "SampleWindowsService")
                            .Build();                   // #4

        var trigger = TriggerBuilder.Create()
                                    .WithIdentity("SampleTrigger", "SampleWindowsService")
                                    .WithCronSchedule(ConfigurationManager.AppSettings\["CronExpression"\])   // #5
                                    .ForJob("SampleJob", "SampleWindowsService")
                                    .Build();           // #6

        this.Scheduler.JobFactory = this.JobFactory;    // #7
        this.Scheduler.ScheduleJob(job, trigger);       // #8
        this.Scheduler.ListenerManager.AddJobListener(this.JobListener);    // #9
        this.Scheduler.Start();                         // #10

        Log.Info("Sample Windows Service started");
    }

    public void Stop()
    {
        Log.Info("Sample Windows Service stopping");

        this.Scheduler.Shutdown();

        Log.Info("Sample Windows Service stopped");
    }

    public void Resume()
    {
        Log.Info("Sample Windows Service resuming");

        this.Scheduler.ResumeAll();

        Log.Info("Sample Windows Service resumed");
    }

    public void Pause()
    {
        Log.Info("Sample Windows Service pausing");

        this.Scheduler.PauseAll();

        Log.Info("Sample Windows Service paused");
    }
} 
```

- `#1`: `IScheduler` instance is injected through the IoC container.
- `#2`: `IJobFactory` instance is injected through the IoC container.
- `#3`: `IJobListener` instance is injected through the IoC container.
- `#4`: Builds a `SampleJob` instance.
- `#5`: Lets a trigger to run the `SampleJob` instance on the schedule using the cron expression.
- `#6`: Builds a trigger instance.
- `#7`: Let the `IScheduler` instance to resolve instances built through the IoC container.
- `#8`: Schedule the `SampleJob` instance with the trigger built.
- `#9`: Adds a `IJobListener` instance while the `SampleJob` is being executed.
- `#10`: Starts the `IScheduler` instance.

`IScheduler` instance is defined in the IoC container and injected into the `SampleService` instance. Make sure, both `IJobFactory` and `IJobListener` instances are also injected from the IoC container. The IoC container is defined by the `SampleModule` instance which comes to the next section.

## Implementing `SampleModule`

`SampleModule` works as an IoC container with `Autofac`. With this, all instances used in this Windows Service are registered and resolved. `SampleModule` inherits the `Autofac.Module` class.

```csharp
internal class SampleModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        this.LoadQuartz(builder);
        this.LoadServices(builder);
        this.LoadLogicLayers(builder);
    }

    private void LoadQuartz(ContainerBuilder builder)
    {
        builder.Register(c => new StdSchedulerFactory().GetScheduler())
               .As()
               .InstancePerLifetimeScope(); // #1
        builder.Register(c => new SampleJobFactory(ContainerProvider.Instance.ApplicationContainer))
               .As();          // #2
        builder.RegisterAssemblyTypes(Assembly.GetExecutingAssembly())
               .Where(p => typeof (IJob).IsAssignableFrom(p))
               .PropertiesAutowired();      // #3
        builder.Register(c => new SampleJobListener(ContainerProvider.Instance))
               .As();         // #4
    }

    private void LoadServices(ContainerBuilder builder)
    {
        builder.RegisterType()
               .As()
               .PropertiesAutowired();      // #5
    }

    private void LoadLogicLayers(ContainerBuilder builder)
    {
        builder.RegisterType()
               .As();    // #6
    }
} 
```

- `#1`: Registers the `IScheduler` instance.
- `#2`: Registers the `IJobFactory` instance.
- `#3`: Registers the `IJob` instance. This will resolve the `SampleJob` instance.
- `#4`: Registers the `IJobListener` instance.
- `#5`: Registers the `IAmAHostedProcess` instance. This will resolve the `SampleService` instance.
- `#6`: Registers the `ISampleLogicLayer` instance. This will run the actual business logic.

When `#5` is resolved, its properties will get `IScheduler`, `IJobFactory` and `IJobListener` instances injected. Let's move onto the `SampleJob` class to execute the **real** job.

## Implementing `SampleJob`

The `SampleJob` class actually runs the business logic instance resolved from the IoC container.

```csharp
internal class SampleJob : IJob
{
    private static readonly ILog Log = LogManager.GetCurrentClassLogger();

    public ISampleLogicLayer SampleLogicLayer { get; set; }

    public void Execute(IJobExecutionContext context)
    {
        Log.Info("Application executing");

        this.SampleLogicLayer.Run();

        Log.Info("Application executed");
    }
}
```

And the `SampleJob` needs the `ISampleLogicLayer` instance.

```csharp
internal interface ISampleLogicLayer : IDisposable
{
    void Run();
}

internal class SampleLogicLayer : ISampleLogicLayer
{
    private static readonly ILog Log = LogManager.GetCurrentClassLogger();

    public void Run()
    {
        Log.Info("This has been run");
    }

    public void Dispose()
    {
    }
}
```

Therefore, when the `SampleJob` instance is executed, it calls the method `Run()` of the `ISampleLogicLayer` instance. The `Run()` method writes a log into the logger instance. So far, we've implemented the **core** logics. However, `Quartz.NET` needs to know whether all necessary instances are resolved or not. Let's move onto the next section to let `Quartz.NET` know the IoC container is ready for use.

## Implementing `SampleJobFactory`

In order to let the `IScheduler` know all necessary instances are ready for use, an `IJobFactory` instance needs to be injected. Here's a code snippet for the class implementing the `IJobFactory` interface.

```csharp
internal class SampleJobFactory : IJobFactory
{
    private readonly IContainer \_container;

    public SampleJobFactory(IContainer container)
    {
        if (container == null)
            throw new ArgumentNullException("container");

        this.\_container = container;
    }

    public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
    {
        if (bundle == null)
            throw new ArgumentNullException("bundle");

        return (IJob)this.\_container.Resolve(bundle.JobDetail.JobType); // #1
    }

    public void ReturnJob(IJob job)
    {
    }
}
```

- `#1`: Returns the resolved job instance. In our example, it returns the `SampleJob` instance resolved from the IoC container.

Let's move back to the `SampleService` section above. The `SampleService` gets this `IJobFactory` instance as a parameter and the `IJobFactory` instance is set to the `ISchedule`'s `JobFactory` property. By doing so, instances that `Autofac` IoC container register and resolve are notified to the scheduler so that it runs the job correctly. Now, as a final section, implement `SampleJobListener` class.

## Implementing `SampleJobListener`

`SampleJobListener` makes sure the job instance gets all necessary instances injected before executing the job and disposes all relevant resources after being executed.

```csharp
internal class SampleJobListener : IJobListener
{
    private readonly IContainerProvider \_provider;

    private IUnitOfWorkContainer \_container;

    public SampleJobListener(IContainerProvider provider)
    {
        if (provider == null)
            throw new ArgumentNullException("provider");

        this.\_provider = provider;
        this.Name = "SampleJobListener";
    }

    public string Name { get; private set; }

    public void JobToBeExecuted(IJobExecutionContext context)
    {
        this.\_container = this.\_provider.CreateUnitOfWork();
        this.\_container.InjectUnsetProperties(context.JobInstance);
    }

    public void JobExecutionVetoed(IJobExecutionContext context)
    {
    }

    public void JobWasExecuted(IJobExecutionContext context, JobExecutionException jobException)
    {
        this.\_container.Dispose();
    }
}
```

As above, all the implementations have been completed. It's now time to run this. In order to debug this application on the console mode, simple put the parameter of `console` on the debug mode.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/autofac-atlas-quartz-02.png)

Make sure that `App.config` needs to have the logging configuration like below.

Once it's done, punch `F5` key for debug. Then you'll see the result similar to the following screen:

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/autofac-atlas-quartz-03.png)

## Conclusion

Implementing a Windows Service with `Autofac`, `Atlas` and `Quartz.NET` is a little bit tricky, as transferring IoC container needs some extra implementation. This sample application can provide a brief overview how to use those libraries in a consolidated manner. Once you are familiar with them, your Windows Service application that needs scheduling will be a lot easier to develop.

## References

- [A quick way to create a windows service using Autofac, Quartz and Atlas](http://markjourdan.name/a-quick-way-to-create-a-windows-service-using-autofac-quartz-and-atlas)
- [How do I create a Quartz.NET’s job requiring injection with autofac](http://www.experts-exchange.com/Programming/Languages/C_Sharp/Q_28150675.html)
- [How to schedule task using Quartz.net 2.0?](http://stackoverflow.com/questions/16653178/how-to-schedule-task-using-quartz-net-2-0)
- [How do I create a Quartz.NET’s job requiring injection with autofac](http://stackoverflow.com/questions/16908342/how-do-i-create-a-quartz-nets-job-requiring-injection-with-autofac)
- [Using Common.Logging API](http://netcommon.sourceforge.net/docs/2.1.0/reference/html/ch01.html#logging-usage)
