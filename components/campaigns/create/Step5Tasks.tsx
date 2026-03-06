"use client";

import { useState } from "react";
import RequiredDeliverables from "@/components/campaigns/RequiredDeliverables";
import DosAndDonts from "@/components/campaigns/DosAndDonts";
import CampaignPrimaryButton from "@/components/ui/CampaignPrimaryButton";
import { StepProps, ScreeningQuestion } from "./types";

export default function Step5Tasks({
  campaignData,
  setCampaignData,
  errors,
  setErrors,
}: StepProps) {
  // Controlled input state for hashtags and mentions
  const [hashtagInput, setHashtagInput] = useState("");
  const [mentionInput, setMentionInput] = useState("");

  const addHashtag = (value: string) => {
    const tags = value.split(/\s+/).filter((t) => t);
    const newTags = tags
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .filter((tag) => !campaignData.requiredHashtags.includes(tag));

    if (newTags.length > 0) {
      setCampaignData({
        ...campaignData,
        requiredHashtags: [...campaignData.requiredHashtags, ...newTags],
      });
    }
    setHashtagInput("");
  };

  const removeHashtag = (index: number) => {
    setCampaignData({
      ...campaignData,
      requiredHashtags: campaignData.requiredHashtags.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addMention = (value: string) => {
    const mentions = value.split(/\s+/).filter((t) => t);
    const newMentions = mentions
      .map((mention) => (mention.startsWith("@") ? mention : `@${mention}`))
      .filter((mention) => !campaignData.mentionsTags.includes(mention));

    if (newMentions.length > 0) {
      setCampaignData({
        ...campaignData,
        mentionsTags: [...campaignData.mentionsTags, ...newMentions],
      });
    }
    setMentionInput("");
  };

  const removeMention = (index: number) => {
    setCampaignData({
      ...campaignData,
      mentionsTags: campaignData.mentionsTags.filter((_, i) => i !== index),
    });
  };

  const addQuestion = () => {
    if (campaignData.screeningQuestions.length >= 5) return;
    const newQuestion: ScreeningQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      answers: [],
    };
    setCampaignData({
      ...campaignData,
      screeningQuestions: [...campaignData.screeningQuestions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, questionText: string) => {
    setCampaignData({
      ...campaignData,
      screeningQuestions: campaignData.screeningQuestions.map((q) =>
        q.id === questionId ? { ...q, question: questionText } : q
      ),
    });
  };

  const removeQuestion = (questionId: string) => {
    setCampaignData({
      ...campaignData,
      screeningQuestions: campaignData.screeningQuestions.filter(
        (q) => q.id !== questionId
      ),
    });
  };

  const addAnswer = (questionId: string, answerText: string) => {
    if (!answerText.trim()) return;
    setCampaignData({
      ...campaignData,
      screeningQuestions: campaignData.screeningQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: `a-${Date.now()}`,
                  text: answerText.trim(),
                  isAcceptable: false,
                },
              ],
            }
          : q
      ),
    });
  };

  const toggleAnswerAcceptable = (questionId: string, answerId: string) => {
    setCampaignData({
      ...campaignData,
      screeningQuestions: campaignData.screeningQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, isAcceptable: !a.isAcceptable } : a
              ),
            }
          : q
      ),
    });
  };

  const removeAnswer = (questionId: string, answerId: string) => {
    setCampaignData({
      ...campaignData,
      screeningQuestions: campaignData.screeningQuestions.map((q) =>
        q.id === questionId
          ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
          : q
      ),
    });
  };

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[#E0E0E0]  w-100 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-brand-navy-dark">
          Required Deliverables
        </h2>
        <p className="text-sm text-gray-500">
          Define exactly what the influencer needs to create.
        </p>
      </div>

      {/* Required Deliverables - Horizontal scroll on mobile */}
      <div>
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <div className="min-w-[600px] md:min-w-0">
            <RequiredDeliverables
              value={campaignData.taskDeliverables}
              onChange={(deliverables) => {
                setCampaignData({
                  ...campaignData,
                  taskDeliverables: deliverables,
                });
                if (errors.taskDeliverables) setErrors({ ...errors, taskDeliverables: "" });
              }}
              minDate={campaignData.contentCreationStart || undefined}
              maxDate={campaignData.startDate || campaignData.contentCreationEnd || undefined}
            />
            {errors.taskDeliverables && (
              <p className="text-sm text-red-500 mt-2">{errors.taskDeliverables}</p>
            )}
          </div>
        </div>
        {/* Mobile scroll hint */}
        <p className="text-xs text-gray-400 mt-2 md:hidden flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Scroll horizontally to see all columns
        </p>
      </div>

      {/* Guidelines - Do's and Don'ts */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          Guidelines
        </h3>
        <DosAndDonts
          dos={campaignData.dos}
          donts={campaignData.donts}
          onDosChange={(v) => setCampaignData({ ...campaignData, dos: v })}
          onDontsChange={(v) => setCampaignData({ ...campaignData, donts: v })}
        />
      </div>

      {/* Metadata Section */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Hashtags */}
          <div>
            <label className="block text-sm font-semibold text-brand-navy-dark mb-3">
              Required Hashtags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                placeholder="#summer #brand #ad"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHashtag(hashtagInput);
                  }
                }}
                // Flush on blur so value isn't lost when navigating away
                onBlur={() => {
                  if (hashtagInput.trim()) {
                    addHashtag(hashtagInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addHashtag(hashtagInput)}
                className="w-10 h-10 flex items-center justify-center bg-[#00A8CC] text-white rounded-lg hover:bg-[#0090b0] transition-colors flex-shrink-0"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {campaignData.requiredHashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00A8CC] text-white rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(index)}
                    className="ml-1 hover:text-gray-200 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mentions / Tags */}
          <div>
            <label className="block text-sm font-semibold text-brand-navy-dark mb-3">
              Mentions / Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                placeholder="@ecoglowsa @sustainablebeautysa"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMention(mentionInput);
                  }
                }}
                // Flush on blur so value isn't lost when navigating away
                onBlur={() => {
                  if (mentionInput.trim()) {
                    addMention(mentionInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addMention(mentionInput)}
                className="w-10 h-10 flex items-center justify-center bg-[#00A8CC] text-white rounded-lg hover:bg-[#0090b0] transition-colors flex-shrink-0"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {campaignData.mentionsTags.map((mention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm"
                >
                  {mention}
                  <button
                    type="button"
                    onClick={() => removeMention(index)}
                    className="ml-1 hover:text-gray-500 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Screening Questions Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Screening Questions (Acceptance Criteria)
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Ask influencers these questions after they apply - select which
              answers you&apos;re looking for (Max 5 questions)
            </p>
          </div>
          <CampaignPrimaryButton
            label="+ Add Question"
            onClick={addQuestion}
            disabled={campaignData.screeningQuestions.length >= 5}
          />
        </div>

        <div className="space-y-6">
          {campaignData.screeningQuestions.map((q, qIndex) => (
            <div
              key={q.id}
              className="border border-gray-200 rounded-xl p-4 md:p-5 bg-white shadow-sm"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Question {qIndex + 1}
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Question Input */}
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Have you previously worked with skincare or beauty brands?"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] mb-4"
              />

              {/* Answer Options Header */}
              <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-700">
                  Answer Options
                </span>
                <span className="text-xs text-[#00A8CC] font-medium">
                  Check acceptable answers
                </span>
              </div>

              {/* Add Option Input */}
              <AnswerInput onAdd={(text) => addAnswer(q.id, text)} />

              {/* Answer Options List */}
              <div className="space-y-2 mt-4">
                {q.answers.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all ${
                      a.isAcceptable
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleAnswerAcceptable(q.id, a.id)}
                      className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                        a.isAcceptable
                          ? "bg-green-500 text-white"
                          : "border-2 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {a.isAcceptable && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Answer Text */}
                    <span
                      className={`flex-1 text-sm ${
                        a.isAcceptable
                          ? "text-green-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {a.text}
                    </span>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeAnswer(q.id, a.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {errors.screeningQuestions && (
          <p className="text-sm text-red-500 mt-2">{errors.screeningQuestions}</p>
        )}

        {campaignData.screeningQuestions.length === 0 && (
          <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-3 text-sm">
              No screening questions added yet
            </p>
            <button
              type="button"
              onClick={addQuestion}
              className="text-[#00A8CC] hover:underline text-sm font-medium"
            >
              + Add your first question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Controlled sub-component for answer inputs to avoid stale closures
function AnswerInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add an option..."
        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <button
        type="button"
        onClick={handleAdd}
        className="w-10 h-10 flex items-center justify-center bg-[#00A8CC] text-white rounded-lg hover:bg-[#0090b0] transition-colors flex-shrink-0"
      >
        <span className="text-xl font-bold">+</span>
      </button>
    </div>
  );
}