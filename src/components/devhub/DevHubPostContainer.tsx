"use client";
import { useParams } from "next/navigation";
import { useDevHubPost } from "@/hooks/useDevHubPost";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { urlFor } from "@/lib/sanityImageUrl";
import { PortableText } from "@portabletext/react";
import portableTextComponents from "./portableTextComponents";
import { FaGithub } from "react-icons/fa";
import devhub1 from "@/assets/devhub/devhub1.svg";
import devhub2 from "@/assets/devhub/devhub2.svg";
import { Button } from "../ui/Button";
import Link from "next/link";
import DevHubPostContainerSkeleton from "../skeleton/DevHubPostContainerSkeleton";
import { Card } from "../ui/Card";
import { Typography } from "../ui/Typography";
import { Dropdown } from "../ui/Dropdown";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DevHubPostContainer = () => {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];
  const { post: blog, isLoading, error } = useDevHubPost(slug || "");
  const [activeHeading, setActiveHeading] = useState("");

  const imageUrl = useMemo(() => {
    if (blog?.image?.asset?._ref) {
      const builder = urlFor(blog.image);
      return builder ? builder.width(1200).auto("format").url() : undefined;
    }
    return undefined;
  }, [blog?.image]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tocOptions =
    blog?.headingPairs?.map((pair, index) => ({
      id: pair.h2Heading,
      name: `[ ${index + 1} ] ${pair.displayHeading}`,
    })) || [];

  useEffect(() => {
    if (!blog || isLoading || error) return;
    const handleScroll = () => {
      const headings = document.querySelectorAll("h2");
      let currentActive = "";
      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= 250) {
          currentActive = headings[i].innerText;
        } else {
          break;
        }
      }
      setActiveHeading(currentActive);

      // Update mobile dropdown selection based on active heading
      if (currentActive && tocOptions.length > 0) {
        const matchingOption = tocOptions.find(
          (option) =>
            option.id === currentActive || option.name.includes(currentActive),
        );
        if (matchingOption) {
          setSelectedTOC(matchingOption.name);
        }
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [error, isLoading, blog, tocOptions]);

  const [selectedTOC, setSelectedTOC] = useState<string>("");

  // Ensure the first option is selected when tocOptions changes
  useEffect(() => {
    if (tocOptions.length > 0 && !selectedTOC) {
      setSelectedTOC(tocOptions[0].name);
    }
  }, [tocOptions, selectedTOC]);

  const handleTOCChange = (option: { id: string | number; name: string }) => {
    setSelectedTOC(option.name);
    const targetElement = document.getElementById(slugify(String(option.id)));
    if (targetElement) {
      const yOffset = -210;
      const y =
        targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (isLoading) return <DevHubPostContainerSkeleton />;
  if (error || !blog) {
    return (
      <Card className="max-w-md w-full flex flex-col items-center text-center gap-4 py-10 mx-auto mt-[100px]">
        <Typography variant="h2" color="primary" className="mb-2">
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body" color="secondary" className="mb-2">
          We couldn&apos;t fetch the content at this time.
        </Typography>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-[#131313] rounded-3xl border border-gray-700 p-6">
        <div className="mb-4 sm:mb-8">
          {imageUrl ? (
            <div className="w-[95%] mx-auto rounded-3xl overflow-hidden h-max">
              <Image
                src={imageUrl}
                alt={blog.title || "Header image"}
                width={1200}
                height={500}
                className="!relative !aspect-video w-full"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-800 h-60 flex items-center justify-center w-full mb-8 text-gray-500">
              No Image Available
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-8 ">
        {/* Mobile Dropdown - Sticky at 200px from top */}
        <Card className="md:hidden sticky top-[80px] sm:top-[84px] z-50 backdrop-blur-lg my-6 py-3">
          {blog && tocOptions.length > 0 && (
            <Dropdown
              label="Table Of Content"
              options={tocOptions}
              selectedOption={selectedTOC}
              onChange={handleTOCChange}
              className="w-full"
            />
          )}
        </Card>

        {/* Table of Content */}
        <aside className="w-full md:w-1/4 min-w-[180px] lg:min-w-[230px] md:sticky top-24 h-full">
          <h2 className="hidden md:block font-actayWide text-sm lg:text-lg font-extrabold my-10">
            Table of Content
          </h2>
          <ul className="hidden md:block space-y-2 font-actay">
            {blog.headingPairs?.map((pair, index) => (
              <li key={index}>
                <a
                  href={`#${slugify(pair.h2Heading)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById(
                      slugify(pair.h2Heading),
                    );
                    if (targetElement) {
                      const yOffset = -160;
                      const y =
                        targetElement.getBoundingClientRect().top +
                        window.scrollY +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  className={`text-xs lg:text-sm 2xl:text-base hover:underline ${activeHeading === pair.h2Heading ? "text-green-400 font-bold" : "text-gray-300"}`}
                >
                  [ {index + 1} ] {pair.displayHeading}
                </a>
              </li>
            ))}
          </ul>
        </aside>
        {/* Blog Content */}
        <article className="w-full md:w-3/4 md:mt-6">
          <PortableText value={blog.body} components={portableTextComponents} />

          <div className="bg-[#141414] rounded-2xl w-full relative h-[300px] flex flex-col gap-3 items-center justify-center p-[50px] overflow-hidden">
            <div className="z-0 absolute left-0 bottom-0 w-[120px] lg:w-[140px] h-max">
              <Image
                src={devhub1}
                alt="sideimg"
                className="w-full h-auto"
              ></Image>
            </div>
            <div className="z-0 absolute right-0 top-0 w-[140px] lg:w-[160px] h-max">
              <Image
                src={devhub2}
                alt="sideimg"
                className="w-full h-auto"
              ></Image>
            </div>
            <p className="relative z-30 max-w-[500px] lg:max-w-[600px] mx-auto text-wrap text-center text-xs sm:text-sm lg:text-base">
              View the complete code and our ready-to-use template
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {/* Open Github Button */}

              <a
                href={blog.githubUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-[200px]"
              >
                <Button color="yellow" className="w-full">
                  <FaGithub className="mr-2 inline-block" />
                  <span>Open Github</span>
                </Button>
              </a>
              {/* Try Now Button */}
              <a
                href={
                  blog.redirect ? `/${blog.redirect}` : blog.redirect || "#"
                }
                rel="noopener noreferrer"
                className="w-full sm:w-[200px]"
              >
                <Button color="yellow" className="w-full">
                  <span className="text-black">⚡ Try Now</span>
                </Button>
              </a>
            </div>
          </div>

          <Link
            href="/devhub"
            className="w-full flex items-center justify-center mt-6"
          >
            <Button color="white" className="mx-auto">
              Go Back to DevHub
            </Button>
          </Link>
        </article>
      </div>
    </div>
  );
};

export default DevHubPostContainer;
