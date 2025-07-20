import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTitleDetails } from "../hooks/useTitleDetails";
import { CoverImage } from "./title/parts/CoverImage";
import { TitleSection } from "./title/parts/TitleSection";
import { ActionButtons } from "./title/parts/ActionButtons";
import { TagsAndStatus } from "./title/parts/TagsAndStatus";
import { InfoBar } from "./title/parts/InfoBar";
import { UploadedChapters } from "./title/parts/UploadedChapters";
import { Comments } from "./title/parts/Comments";
import { CoverImages } from "./title/parts/CoverImages";
import { ScrapedChapters } from "./title/parts/ScrapedChapters";

const TABS = [
  { label: "Uploaded Chapters" },
  { label: "Scraped Chapters" },
  { label: "Comments (0)" }, //TODO: comments section
  { label: "Art" },
];

const TitleDetails: React.FC = () => {
  const { titleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, loading: titleLoading, error } = useTitleDetails(titleId);
  const [selectedTab, setSelectedTab] = useState(0);

  if (titleLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!title) return <div>Title not found</div>;

  const coverUrl = title.images.jpg.large_image_url;

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(32px)',
          opacity: 0.25,
        }}
        aria-hidden="true"
      />
      {/* Foreground */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-2 md:px-8 mt-8">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <CoverImage src={coverUrl} alt={title.title} />
            <div className="flex-1 w-full">
              <TitleSection title={title} />
              <div className="mt-4">
                <ActionButtons user={user} titleId={titleId} navigate={navigate} />
              </div>
              <InfoBar title={title} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 mb-4">{title.synopsis || "No synopsis found"}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-2 md:px-8 mt-8">
          <div className="flex space-x-2 border-b mb-4">
            {TABS.map((tab, idx) => (
              <button
                key={tab.label}
                className={`px-4 py-2 text-sm font-medium focus:outline-none border-b-2 transition-colors ${selectedTab === idx
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-indigo-600"
                  }`}
                onClick={() => setSelectedTab(idx)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-2 md:px-8">
          <div className="flex flex-col justify-start items-start w-full">
            {selectedTab === 0 && (
              <TagsAndStatus title={title} />
            )}
          </div>
          <div className="md:col-span-2 flex flex-col justify-start items-start w-full">
            <div className="w-full">
              {selectedTab === 0 && (
                <UploadedChapters
                  titleId={titleId}
                  navigate={navigate}
                />
              )}
              {selectedTab === 1 && (
                <ScrapedChapters
                  title={title}
                  navigate={navigate}
                />
              )}
              {selectedTab === 2 && <Comments />}
              {selectedTab === 3 && (
                <CoverImages titleId={titleId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default TitleDetails;