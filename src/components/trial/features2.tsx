import { ArrowUpRight, ChevronRight, ChevronUp } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Feature = () => {
  return (
    <section className="bg-background py-32">
      <div className="px-0! container relative flex flex-col items-center lg:pt-8">
        <DottedDiv>
          <div className="grid lg:grid-cols-2">
            {/* Left Content */}
            <div className="flex w-full flex-col gap-8 px-10 py-20 md:px-14">
              <Badge
                variant="outline"
                className="flex w-fit cursor-pointer items-center gap-4 rounded-full px-6 py-2 transition-all ease-in-out hover:gap-6"
              >
                <span className="text-muted-foreground text-sm font-medium tracking-tight">
                  Copy paste Blocks for your app
                </span>
                <ChevronRight className="size-4!" />
              </Badge>
              <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">
                The Blocks Built
                <br />
                With Shadcn
                <br />
                &amp; Tailwind.
              </h1>
              <p className="text-muted-foreground tracking-tight md:text-xl">
                Finely crafted components built with React, Tailwind and Shadcn
                UI. Developers can copy and paste these blocks directly into
                their project.
              </p>
              <div className="flex w-full gap-2">
                <Button className="text-md bg-primary text-primary-foreground h-12 w-fit rounded-full px-10">
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="text-md h-12 w-12 rounded-full transition-all ease-in-out hover:rotate-45"
                >
                  <ArrowUpRight />
                </Button>
              </div>
            </div>
            {/* Right Content */}
            <DottedDiv className="group size-full place-self-end p-4 lg:w-4/6">
              <div className="bg-muted/50 group-hover:bg-muted relative h-full w-full p-4 transition-all ease-in-out">
                {/* Bg Image div */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl">
                  <img
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-5oYbG-sEImY-unsplash.jpg"
                    alt="aiImage"
                    className="h-full w-full object-cover"
                  />
                  <div className="bg-linear-to-t absolute inset-0 from-black/70 to-transparent"></div>
                </div>

                <div className="absolute top-4 -ml-4 flex h-full w-full flex-col items-center justify-between p-10">
                  <p className="text-background flex w-full items-center text-xl tracking-tighter">
                    2025 <span className="bg-background mx-2 h-2.5 w-[1px]" />
                    March
                  </p>
                  <div className="flex flex-col items-center justify-center">
                    <h2 className="text-background text-center text-6xl font-semibold tracking-tight">
                      New <br />
                      Collection
                    </h2>
                    <div className="bg-background mt-2 h-1 w-6 rounded-full" />
                    <p className="text-background/80 mt-10 max-w-sm px-2 text-center text-lg font-light leading-5 tracking-tighter">
                      Discover our latest release of beautifully crafted
                      components.
                    </p>
                  </div>
                  <a
                    href="#"
                    className="text-background group mb-6 flex cursor-pointer flex-col items-center justify-center"
                  >
                    <ChevronUp
                      size={30}
                      className="transition-all ease-in-out group-hover:-translate-y-2"
                    />
                    <p className="text-background text-xl tracking-tight">
                      See All
                    </p>
                  </a>
                </div>
              </div>
            </DottedDiv>
          </div>
        </DottedDiv>
      </div>
    </section>
  );
};

export { Feature };

const DottedDiv = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative", className)}>
    <div className="-left-25 bg-muted absolute top-4 h-[1.5px] w-[115%]" />
    <div className="-left-25 bg-muted absolute bottom-4 h-[1.5px] w-[115%]" />
    <div className="-top-25 bg-muted absolute left-4 h-[130%] w-[1.5px]" />
    <div className="-top-25 bg-muted absolute right-4 h-[130%] w-[1.5px]" />
    <div className="bg-foreground absolute left-[12.5px] top-[12.5px] z-10 size-2 rounded-full" />
    <div className="bg-foreground absolute right-[12.5px] top-[12.5px] z-10 size-2 rounded-full" />
    <div className="bg-foreground absolute bottom-[12.5px] left-[12.5px] z-10 size-2 rounded-full" />
    <div className="bg-foreground absolute bottom-[12.5px] right-[12.5px] z-10 size-2 rounded-full" />
    {children}
  </div>
);
