"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useToast } from "@/components/ui/ToastContainer";
import { ProgressStepper } from "@/components/campaigns";
import SecondaryOutlinedButton from "@/components/ui/SecondaryOutlinedButton";
import CampaignPrimaryButton from "@/components/ui/CampaignPrimaryButton";
import { ChevronRight, Save, Check, ArrowLeft } from "lucide-react";
import { TaskDeliverable } from "@/components/campaigns/RequiredDeliverables";
import { CampaignStatus } from "@/types/campaign";
import {
  uploadCampaignFiles,
  UploadedFile,
} from "@/lib/firebase/storage-utils";

// Step Components
import Step1Details from "@/components/campaigns/create/Step1Details";
import Step2Product from "@/components/campaigns/create/Step2Product";
import Step3Audience from "@/components/campaigns/create/Step3Audience";
import Step4Budget from "@/components/campaigns/create/Step4Budget";
import Step5Tasks from "@/components/campaigns/create/Step5Tasks";
import Step6Review from "@/components/campaigns/create/Step6Review";
import PublishConfirmDialog from "@/components/campaigns/create/PublishConfirmDialog";
import {
  CampaignData,
  ValidationErrors,
  ScreeningQuestion,
  STEPS,
  initialCampaignData,
} from "@/components/campaigns/create/types";

// Helper to format date string for input fields (YYYY-MM-DD)
const formatDateForInput = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return "";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

function CreateCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const { user, firebaseUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [wasPublished, setWasPublished] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [campaignData, setCampaignData] =
    useState<CampaignData>(initialCampaignData);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const draftCampaignIdRef = useRef<string | null>(campaignId);
  const draftLoadedRef = useRef(false);
  const autoSavingRef = useRef(false);
  const routerRef = useRef(router);
  const toastRef = useRef(toast);
  const stepsInteractedRef = useRef<Set<number>>(new Set());
  const suppressValidationRef = useRef(false);
  const stepRef = useRef(step);
  stepRef.current = step;
  const originalDatesRef = useRef<{
    applicationDeadline: string;
    startDate: string;
    endDate: string;
    contentCreationStart: string;
    contentCreationEnd: string;
  } | null>(null);

  // Keep refs up to date
  routerRef.current = router;
  toastRef.current = toast;

  // Load draft data if editing an existing campaign
  useEffect(() => {
    const loadDraft = async () => {
      if (!campaignId || !firebaseUser) return;
      if (draftLoadedRef.current) return;
      draftLoadedRef.current = true;

      setLoadingDraft(true);
      try {
        const headers: HeadersInit = {};
        try {
          const token = await firebaseUser.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (error) {
          console.warn("Failed to get ID token:", error);
          if (user) {
            headers["x-user-id"] = user.uid;
          }
        }

        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: "GET",
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.campaign) {
            const campaign = data.data.campaign;
            setIsEditing(true);
            if (campaign.status && campaign.status !== CampaignStatus.DRAFT) {
              setWasPublished(true);
            }
            const interestsString = Array.isArray(
              campaign.audience?.interests_and_affiliates,
            )
              ? campaign.audience.interests_and_affiliates.join(", ")
              : campaign.audience?.interests_and_affiliates || "";

            // Suppress real-time validation during draft hydration
            suppressValidationRef.current = true;

            // Map campaign data to form fields
            setCampaignData({
              title: campaign.campaignTitle || "",
              description: campaign.description || "",
              objectives: Array.isArray(campaign.campaignObjectives)
                ? campaign.campaignObjectives.join(", ")
                : campaign.campaignObjectives || "",
              KPIs: campaign.kpi || "",
              paymentTerms: campaign.budget?.paymentTerms || "",
              campaignCategories: campaign.campaignCategories || [],
              productName: campaign.campaignProduct?.productName || "",
              productType: campaign.campaignProduct?.productType || "",
              productValue:
                campaign.campaignProduct?.productValue?.toString() || "",
              productLink: campaign.campaignProduct?.productLink || "",
              productImages: [],
              accessInstructions:
                campaign.campaignProduct?.accessInstructions || "",
              contentDetails: campaign.campaignProduct?.contentDetails || "",
              keepProductAsGift:
                campaign.campaignProduct?.keepsProduct || false,
              reimburseWithVoucher:
                campaign.campaignProduct?.willReimburse_or_productShipped ||
                false,
              reimbursementAmount:
                campaign.campaignProduct?.reimburseAmount?.toString() || "",
              compensationModel: campaign.budget?.compensationModel || "fixed",
              currency: campaign.budget?.currency || "ZAR",
              fixedAmount: campaign.budget?.fixedAmount?.toString() || "",
              budgetFrom: campaign.budget?.minRangeAmount || "",
              budgetTo: campaign.budget?.maxRangeAmount || "",
              allowBidsMarketplace:
                campaign.budget?.allowBidsMarketPlace || false,
              startDate: formatDateForInput(campaign.campaignStart),
              endDate: formatDateForInput(campaign.campaignEnd),
              applicationDeadline: formatDateForInput(
                campaign.budget?.applicationDeadline,
              ),
              contentCreationStart: formatDateForInput(
                campaign.budget?.contentCreationStart ||
                  campaign.budget?.contentCreationDate,
              ),
              contentCreationEnd: formatDateForInput(
                campaign.budget?.contentCreationEnd,
              ),
              visibility: campaign.campaignVisibility || "public",
              minFollowers: campaign.audience?.minFollowers || "",
              minEngagementRate: campaign.audience?.minEngagements || "",
              ageRangeFrom: campaign.audience?.ageMin || "",
              ageRangeTo: campaign.audience?.ageMax || "",
              gender: campaign.audience?.gender || "",
              interests: interestsString,
              location: campaign.audience?.targetLocation || "",
              dos: campaign.tasks?.dos || [],
              donts: campaign.tasks?.donts || [],
              taskDeliverables: (
                campaign.tasks?.requiredDeliverables || []
              ).map((d: any) => ({
                id: Math.random().toString(36).slice(2, 9),
                platform: d.platform || "instagram",
                type: d.type || "",
                details: d.details || "",
                dueDate: d.dueDate || "",
              })),
              requiredHashtags: Array.isArray(
                campaign.tasks?.metaData?.requiredHashTags,
              )
                ? campaign.tasks.metaData.requiredHashTags // It's already an array, use it!
                : typeof campaign.tasks?.metaData?.requiredHashTags === "string"
                  ? campaign.tasks.metaData.requiredHashTags
                      .split(",")
                      .map((h: string) => h.trim())
                      .filter(Boolean) // It's an old string, split it
                  : [], // Fallback for undefined/null

              mentionsTags: Array.isArray(
                campaign.tasks?.metaData?.mentions_or_tags,
              )
                ? campaign.tasks.metaData.mentions_or_tags
                : typeof campaign.tasks?.metaData?.mentions_or_tags === "string"
                  ? campaign.tasks.metaData.mentions_or_tags
                      .split(",")
                      .map((m: string) => m.trim())
                      .filter(Boolean)
                  : [],
              screeningQuestions: (campaign.tasks?.questions || []).map(
                (q: any) => ({
                  id: Math.random().toString(36).slice(2, 9),
                  question: q.question || "",
                  answers: (q.answers || []).map((a: string) => ({
                    id: Math.random().toString(36).slice(2, 9),
                    text: a,
                    isAcceptable: true,
                  })),
                }),
              ),
              campaignAssets: [],
              moodBoard: [],
              campaignBrief: [],
              contractNDA: [],
              uploadedCampaignAssets: campaign.campaignAssets || [],
              uploadedMoodBoard: campaign.campaignMoodBoard || [],
              uploadedCampaignBrief: campaign.campaignBrief || [],
              uploadedContractNDA: campaign.campaignContract || [],
              uploadedProductImages: (
                campaign.campaignProduct?.productImagesUrls || []
              ).map((url: string) => ({
                name: url.split("/").pop() || "image",
                type: "image/jpeg",
                url,
              })),
            });

            // Store original dates so we can skip past-date validation
            // for unchanged fields when editing
            originalDatesRef.current = {
              applicationDeadline: formatDateForInput(campaign.budget?.applicationDeadline),
              startDate: formatDateForInput(campaign.campaignStart),
              endDate: formatDateForInput(campaign.campaignEnd),
              contentCreationStart: formatDateForInput(
                campaign.budget?.contentCreationStart || campaign.budget?.contentCreationDate,
              ),
              contentCreationEnd: formatDateForInput(campaign.budget?.contentCreationEnd),
            };
          }
        } else {
          toastRef.current.error("Failed to load draft campaign");
          routerRef.current.push("/brands/campaigns");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toastRef.current.error("Error loading draft campaign");
      } finally {
        setLoadingDraft(false);
        setTimeout(() => { suppressValidationRef.current = false; }, 0);
      }
    };

    loadDraft();
  }, [campaignId, firebaseUser, user]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (currentStep === 1) {
      if (!campaignData.title.trim()) {
        newErrors.title = "Campaign title is required";
      }
      if (campaignData.campaignCategories.length === 0) {
        newErrors.campaignCategories =
          "At least one campaign category is required";
      }
      if (!campaignData.description.trim()) {
        newErrors.description = "Campaign description is required";
      }
      if (!campaignData.objectives.trim()) {
        newErrors.objectives = "Campaign objective is required";
      }
      if (!campaignData.KPIs.trim()) {
        newErrors.KPIs = "Key Performance Indicators are required";
      }
    }

    if (currentStep === 2) {
      if (!campaignData.productType) {
        newErrors.productType = "Please select a product type";
      }
      if (!campaignData.productName.trim()) {
        newErrors.productName = "Product name is required";
      }
      if (campaignData.productType === "brand_repost" && !campaignData.contentDetails.trim()) {
        newErrors.contentDetails = "Content details are required for brand reposts";
      }
      if ((campaignData.productType === "service" || campaignData.productType === "digital_product") && !campaignData.accessInstructions.trim()) {
        newErrors.accessInstructions = "Access instructions are required for this product type";
      }
      if (campaignData.reimburseWithVoucher && !campaignData.reimbursementAmount.trim()) {
        newErrors.reimbursementAmount = "Reimbursement amount is required when voucher reimbursement is enabled";
      }
      if (campaignData.productLink.trim()) {
        try {
          new URL(campaignData.productLink.trim());
        } catch {
          newErrors.productLink = "Please enter a valid URL (e.g. https://example.com)";
        }
      }
      if (campaignData.productValue && Number(campaignData.productValue) < 0) {
        newErrors.productValue = "Product value cannot be negative";
      }
    }

    if (currentStep === 3) {
      const ageFrom = Number(campaignData.ageRangeFrom);
      const ageTo = Number(campaignData.ageRangeTo);
      if (campaignData.ageRangeFrom && ageFrom < 13) {
        newErrors.ageRangeFrom = "Minimum age must be at least 13";
      }
      if (campaignData.ageRangeTo && ageTo > 100) {
        newErrors.ageRangeTo = "Age max cannot be greater than 100";
      }
      if (campaignData.ageRangeFrom && campaignData.ageRangeTo && !newErrors.ageRangeTo && ageFrom >= ageTo) {
        newErrors.ageRangeTo = "Age max must be greater than age min";
      }
      if (campaignData.interests && !campaignData.interests.trim()) {
        newErrors.interests = "Interests cannot be whitespace only";
      }
      if (campaignData.minFollowers && Number(campaignData.minFollowers) < 0) {
        newErrors.minFollowers = "Min followers cannot be less than 0";
      }
      if (campaignData.minEngagementRate && Number(campaignData.minEngagementRate) < 0) {
        newErrors.minEngagementRate = "Min engagement cannot be less than 0";
      }
      if (campaignData.location && !campaignData.location.trim()) {
        newErrors.location = "Target location cannot be whitespace only";
      }
    }

    if (currentStep === 4) {
      // Budget validation
      if (campaignData.compensationModel === "fixed") {
        if (!campaignData.fixedAmount || Number(campaignData.fixedAmount) <= 0) {
          newErrors.fixedAmount = "Please enter a compensation amount";
        }
      } else {
        if (!campaignData.budgetFrom || Number(campaignData.budgetFrom) <= 0) {
          newErrors.budgetFrom = "Please enter a minimum budget";
        }
        if (!campaignData.budgetTo || Number(campaignData.budgetTo) <= 0) {
          newErrors.budgetTo = "Please enter a maximum budget";
        }
        if (campaignData.budgetFrom && campaignData.budgetTo && Number(campaignData.budgetFrom) >= Number(campaignData.budgetTo)) {
          newErrors.budgetTo = "Maximum budget must be greater than minimum budget";
        }
      }

      // Timeline validation
      // When editing, skip "cannot be in the past" for dates the user hasn't changed
      const today = new Date().toISOString().split("T")[0];
      const orig = originalDatesRef.current;

      if (!campaignData.applicationDeadline) {
        newErrors.applicationDeadline = "Application deadline is required";
      } else if (
        campaignData.applicationDeadline < today &&
        campaignData.applicationDeadline !== orig?.applicationDeadline
      ) {
        newErrors.applicationDeadline = "Application deadline cannot be in the past";
      }
      if (!campaignData.startDate) {
        newErrors.startDate = "Campaign start date is required";
      } else if (
        campaignData.startDate < today &&
        campaignData.startDate !== orig?.startDate
      ) {
        newErrors.startDate = "Campaign start date cannot be in the past";
      }
      if (!campaignData.endDate) {
        newErrors.endDate = "Campaign end date is required";
      } else if (
        campaignData.endDate < today &&
        campaignData.endDate !== orig?.endDate
      ) {
        newErrors.endDate = "Campaign end date cannot be in the past";
      }
      if (
        campaignData.startDate &&
        campaignData.endDate &&
        campaignData.endDate <= campaignData.startDate
      ) {
        newErrors.endDate = "Campaign end date must be after the start date";
      }
      if (
        campaignData.applicationDeadline &&
        campaignData.startDate &&
        campaignData.applicationDeadline > campaignData.startDate
      ) {
        newErrors.applicationDeadline = "Application deadline must be before the campaign start date";
      }
      if (
        campaignData.contentCreationStart &&
        campaignData.contentCreationEnd &&
        campaignData.contentCreationEnd <= campaignData.contentCreationStart
      ) {
        newErrors.contentCreationEnd = "Content creation end date must be after start date";
      }
      if (
        campaignData.contentCreationStart &&
        campaignData.contentCreationStart < today &&
        campaignData.contentCreationStart !== orig?.contentCreationStart
      ) {
        newErrors.contentCreationEnd = "Content creation dates cannot be in the past";
      }
    }

    if (currentStep === 5) {
      if (campaignData.taskDeliverables.length === 0) {
        newErrors.taskDeliverables = "Please add at least one deliverable";
      } else {
        const incompleteDeliverable = campaignData.taskDeliverables.find(
          (d) => !d.platform || !d.type
        );
        if (incompleteDeliverable) {
          newErrors.taskDeliverables = "Each deliverable must have a platform and type selected";
        }

        // Validate deliverable due dates fall within content creation timeframe and before campaign start
        for (const d of campaignData.taskDeliverables) {
          if (d.dueDate) {
            if (campaignData.contentCreationStart && d.dueDate < campaignData.contentCreationStart) {
              newErrors.taskDeliverables = "Deliverable due dates must fall within the content creation timeframe";
              break;
            }
            if (campaignData.contentCreationEnd && d.dueDate > campaignData.contentCreationEnd) {
              newErrors.taskDeliverables = "Deliverable due dates must fall within the content creation timeframe";
              break;
            }
            if (campaignData.startDate && d.dueDate > campaignData.startDate) {
              newErrors.taskDeliverables = "Deliverable due dates must be before the campaign start date";
              break;
            }
          }
        }
      }

      // Validate screening questions — no empty question text or empty answers
      for (let i = 0; i < campaignData.screeningQuestions.length; i++) {
        const q = campaignData.screeningQuestions[i];
        if (!q.question.trim()) {
          newErrors.screeningQuestions = `Question ${i + 1} cannot have empty text`;
          break;
        }
        const emptyAnswer = q.answers.find((a) => !a.text.trim());
        if (emptyAnswer) {
          newErrors.screeningQuestions = `Question ${i + 1} has an answer with empty text`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build the request body for saving (reused by both auto-save and full submit)
  const buildDraftRequestBody = useCallback(() => {
    const interestsArray = campaignData.interests
      ? campaignData.interests.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    return {
      campaignTitle: campaignData.title || "",
      description: campaignData.description || "",
      campaignObjectives: campaignData.objectives
        ? campaignData.objectives.split(",").map((o) => o.trim()).filter(Boolean)
        : [],
      campaignCategories: campaignData.campaignCategories || [],
      kpi: campaignData.KPIs || "",
      campaignVisibility: campaignData.visibility || "public",
      campaignAssets: campaignData.uploadedCampaignAssets || [],
      campaignMoodBoard: campaignData.uploadedMoodBoard || [],
      campaignBrief: campaignData.uploadedCampaignBrief || [],
      campaignContract: campaignData.uploadedContractNDA || [],
      campaignStart: campaignData.startDate || null,
      campaignEnd: campaignData.endDate || null,
      campaignProduct: {
        productType: campaignData.productType || "",
        productName: campaignData.productName || "",
        productImagesUrls: (campaignData.uploadedProductImages || []).map((f) => f.url),
        productValue: Number(campaignData.productValue) || 0,
        productLink: campaignData.productLink || "",
        willReimburse_or_productShipped: campaignData.reimburseWithVoucher || false,
        keepsProduct: campaignData.keepProductAsGift || false,
        reimburseAmount: Number(campaignData.reimbursementAmount) || 0,
        accessInstructions: campaignData.accessInstructions || "",
        contentDetails: campaignData.contentDetails || "",
      },
      audience: {
        ageMin: Number(campaignData.ageRangeFrom) || 18,
        ageMax: Number(campaignData.ageRangeTo) || 65,
        gender: campaignData.gender || "any",
        targetLocation: campaignData.location || "",
        interests_and_affiliates: interestsArray,
        minFollowers: Number(campaignData.minFollowers) || 0,
        minEngagements: Number(campaignData.minEngagementRate) || 0,
      },
      budget: {
        compensationModel: campaignData.compensationModel || "fixed",
        currency: campaignData.currency || "ZAR",
        fixedAmount: Number(campaignData.fixedAmount) || 0,
        minRangeAmount: Number(campaignData.budgetFrom) || 0,
        maxRangeAmount: Number(campaignData.budgetTo) || 0,
        paymentTerms: campaignData.paymentTerms || "",
        allowBidsMarketPlace: campaignData.allowBidsMarketplace || false,
        applicationDeadline: campaignData.applicationDeadline || null,
        contentCreationStart: campaignData.contentCreationStart || null,
        contentCreationEnd: campaignData.contentCreationEnd || null,
      },
      tasks: {
        requiredDeliverables: campaignData.taskDeliverables.map((d) => ({
          platform: d.platform || "",
          type: d.type || "",
          details: d.details || "",
          dueDate: d.dueDate || "",
          status: "not started",
        })),
        dos: campaignData.dos || [],
        donts: campaignData.donts || [],
        metaData: {
          requiredHashTags: campaignData.requiredHashtags || [],
          mentions_or_tags: campaignData.mentionsTags || [],
        },
        questions: campaignData.screeningQuestions.map((q) => ({
          question: q.question || "",
          answers: q.answers.map((a) => a.text),
        })),
      },
      status: wasPublished ? CampaignStatus.PUBLISHED : CampaignStatus.DRAFT,
    };
  }, [campaignData, wasPublished]);

  // Background auto-save as draft (no loading overlay, silent)
  const autoSaveDraft = useCallback(async () => {
    if (!firebaseUser || !user || autoSavingRef.current) return;
    autoSavingRef.current = true;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      try {
        const token = await firebaseUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch {
        headers["x-user-id"] = user.uid;
      }

      let targetId = draftCampaignIdRef.current;

      // Create the draft if it doesn't exist yet
      if (!targetId) {
        const createRes = await fetch("/api/campaigns", {
          method: "POST",
          headers,
          body: JSON.stringify({
            campaignTitle: campaignData.title || "Untitled Campaign",
            description: campaignData.description || "",
            status: CampaignStatus.DRAFT,
            isDraft: true,
          }),
        });
        if (!createRes.ok) throw new Error("Failed to create draft");
        const createData = await createRes.json();
        targetId = createData.data.id;
        draftCampaignIdRef.current = targetId;
        setIsEditing(true);
      }

      // Upload any pending files before saving
      const hasFilesToUpload =
        campaignData.campaignAssets.length > 0 ||
        campaignData.moodBoard.length > 0 ||
        campaignData.campaignBrief.length > 0 ||
        campaignData.contractNDA.length > 0 ||
        campaignData.productImages.length > 0;

      if (hasFilesToUpload && targetId) {
        const uploadedFiles = await uploadCampaignFiles(
          targetId,
          {
            campaignAssets: campaignData.campaignAssets,
            moodBoard: campaignData.moodBoard,
            campaignBrief: campaignData.campaignBrief,
            contractNDA: campaignData.contractNDA,
            productImages: campaignData.productImages,
          },
        );

        // Merge newly uploaded URLs into state so buildDraftRequestBody picks them up
        suppressValidationRef.current = true;
        setCampaignData((prev) => ({
          ...prev,
          uploadedCampaignAssets: [
            ...prev.uploadedCampaignAssets,
            ...uploadedFiles.campaignAssets,
          ],
          uploadedMoodBoard: [
            ...prev.uploadedMoodBoard,
            ...uploadedFiles.moodBoard,
          ],
          uploadedCampaignBrief: [
            ...prev.uploadedCampaignBrief,
            ...uploadedFiles.campaignBrief,
          ],
          uploadedContractNDA: [
            ...prev.uploadedContractNDA,
            ...uploadedFiles.contractNDA,
          ],
          uploadedProductImages: [
            ...prev.uploadedProductImages,
            ...uploadedFiles.productImages,
          ],
          // Clear pending File arrays
          campaignAssets: [],
          moodBoard: [],
          campaignBrief: [],
          contractNDA: [],
          productImages: [],
        }));
        setTimeout(() => { suppressValidationRef.current = false; }, 0);

        // Build request body with the newly uploaded files included
        // (We need to manually merge since setState is async and buildDraftRequestBody
        // would still see the old state)
        const bodyWithFiles = buildDraftRequestBody();
        bodyWithFiles.campaignAssets = [
          ...campaignData.uploadedCampaignAssets,
          ...uploadedFiles.campaignAssets,
        ];
        bodyWithFiles.campaignMoodBoard = [
          ...campaignData.uploadedMoodBoard,
          ...uploadedFiles.moodBoard,
        ];
        bodyWithFiles.campaignBrief = [
          ...campaignData.uploadedCampaignBrief,
          ...uploadedFiles.campaignBrief,
        ];
        bodyWithFiles.campaignContract = [
          ...campaignData.uploadedContractNDA,
          ...uploadedFiles.contractNDA,
        ];
        bodyWithFiles.campaignProduct.productImagesUrls = [
          ...campaignData.uploadedProductImages,
          ...uploadedFiles.productImages,
        ].map((f) => f.url);

        const res = await fetch(`/api/campaigns/${targetId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(bodyWithFiles),
        });

        if (res.ok) {
          toastRef.current.success(wasPublished ? "Campaign saved" : "Draft saved");
        }
      } else {
        // No pending files, just save the form data
        const res = await fetch(`/api/campaigns/${targetId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(buildDraftRequestBody()),
        });

        if (res.ok) {
          toastRef.current.success(wasPublished ? "Campaign saved" : "Draft saved");
        }
      }
    } catch (err) {
      console.error("Auto-save draft failed:", err);
    } finally {
      autoSavingRef.current = false;
    }
  }, [firebaseUser, user, campaignData, buildDraftRequestBody]);

  // Wrapper that marks the current step as interacted before updating campaign data
  const handleCampaignDataChange: React.Dispatch<React.SetStateAction<CampaignData>> = useCallback(
    (action) => {
      stepsInteractedRef.current.add(stepRef.current);
      setCampaignData(action);
    },
    []
  );

  // Debounced real-time validation — runs when campaignData changes on interacted steps
  useEffect(() => {
    if (suppressValidationRef.current) return;
    if (!stepsInteractedRef.current.has(step)) {
      setErrors({});
      return;
    }
    const timer = setTimeout(() => {
      validateStep(step);
    }, 300);
    return () => clearTimeout(timer);
  }, [campaignData, step]);

  const handleNext = () => {
    stepsInteractedRef.current.add(step);
    const isValid = validateStep(step);
    if (isValid) {
      setErrors({});
      setStep((prev) => prev + 1);
      // Auto-save draft in background
      autoSaveDraft();
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (draft: boolean = false) => {
    if (!firebaseUser || !user) return;
    setLoading(true);
    setUploadProgress("");

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      try {
        const token = await firebaseUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.warn("Failed to get ID token, using fallback auth:", error);
        headers["x-user-id"] = user.uid;
      }

      // Determine the campaign ID to use for file uploads
      let targetCampaignId = draftCampaignIdRef.current || campaignId;

      // If creating a new campaign, we need to create it first to get the ID
      if (!targetCampaignId) {
        setUploadProgress("Creating campaign...");

        // Create campaign first with minimal data to get ID
        const createResponse = await fetch("/api/campaigns", {
          method: "POST",
          headers,
          body: JSON.stringify({
            campaignTitle: campaignData.title || "Untitled Campaign",
            description: campaignData.description || "",
            campaignObjectives: campaignData.objectives
              ? campaignData.objectives
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean)
              : [],
            status: CampaignStatus.DRAFT, // Always create as draft first
            isDraft: true,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || "Failed to create campaign");
        }

        const createData = await createResponse.json();
        targetCampaignId = createData.data.id;
        draftCampaignIdRef.current = targetCampaignId;
      }

      if (!targetCampaignId) {
        throw new Error("No campaign ID available for file upload");
      }

      // Check if there are any files to upload
      const hasFilesToUpload =
        campaignData.campaignAssets.length > 0 ||
        campaignData.moodBoard.length > 0 ||
        campaignData.campaignBrief.length > 0 ||
        campaignData.contractNDA.length > 0 ||
        campaignData.productImages.length > 0;

      // Upload files to Firebase Storage
      let uploadedFiles = {
        campaignAssets: [] as UploadedFile[],
        moodBoard: [] as UploadedFile[],
        campaignBrief: [] as UploadedFile[],
        contractNDA: [] as UploadedFile[],
        productImages: [] as UploadedFile[],
      };

      if (hasFilesToUpload) {
        setUploadProgress("Uploading files...");

        uploadedFiles = await uploadCampaignFiles(
          targetCampaignId,
          {
            campaignAssets: campaignData.campaignAssets,
            moodBoard: campaignData.moodBoard,
            campaignBrief: campaignData.campaignBrief,
            contractNDA: campaignData.contractNDA,
            productImages: campaignData.productImages,
          },
          (message) => setUploadProgress(message),
        );
      }

      // Combine newly uploaded files with previously uploaded files
      const finalCampaignAssets = [
        ...campaignData.uploadedCampaignAssets,
        ...uploadedFiles.campaignAssets,
      ];
      const finalMoodBoard = [
        ...campaignData.uploadedMoodBoard,
        ...uploadedFiles.moodBoard,
      ];
      const finalCampaignBrief = [
        ...campaignData.uploadedCampaignBrief,
        ...uploadedFiles.campaignBrief,
      ];
      const finalContractNDA = [
        ...campaignData.uploadedContractNDA,
        ...uploadedFiles.contractNDA,
      ];
      const finalProductImages = [
        ...campaignData.uploadedProductImages,
        ...uploadedFiles.productImages,
      ];

      const interestsArray = campaignData.interests
        ? campaignData.interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean) // Remove empty strings
        : [];

      setUploadProgress("Saving campaign...");

      // Build request body structure
      const requestBody = {
        // Basic Info
        campaignTitle: campaignData.title || "",
        description: campaignData.description || "",
        campaignObjectives: campaignData.objectives
          ? campaignData.objectives
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : [],
        campaignCategories: campaignData.campaignCategories || [],
        kpi: campaignData.KPIs || "",
        campaignVisibility: campaignData.visibility || "public",

        // File Attachments
        campaignAssets: finalCampaignAssets,
        campaignMoodBoard: finalMoodBoard,
        campaignBrief: finalCampaignBrief,
        campaignContract: finalContractNDA,

        // Timeline (top-level dates)
        campaignStart: campaignData.startDate || null,
        campaignEnd: campaignData.endDate || null,

        // Product (nested object)
        campaignProduct: {
          productType: campaignData.productType || "",
          productName: campaignData.productName || "",
          productImagesUrls: finalProductImages.map((f: UploadedFile) => f.url),
          productValue: Number(campaignData.productValue) || 0,
          productLink: campaignData.productLink || "",
          willReimburse_or_productShipped:
            campaignData.reimburseWithVoucher || false,
          keepsProduct: campaignData.keepProductAsGift || false,
          reimburseAmount: Number(campaignData.reimbursementAmount) || 0,
          accessInstructions: campaignData.accessInstructions || "",
          contentDetails: campaignData.contentDetails || "",
        },

        // Audience (nested object)
        audience: {
          ageMin: Number(campaignData.ageRangeFrom) || 18,
          ageMax: Number(campaignData.ageRangeTo) || 65,
          gender: campaignData.gender || "any",
          targetLocation: campaignData.location || "",
          interests_and_affiliates: interestsArray,
          minFollowers: Number(campaignData.minFollowers) || 0,
          minEngagements: Number(campaignData.minEngagementRate) || 0,
        },

        // Budget (nested object)
        budget: {
          compensationModel: campaignData.compensationModel || "fixed",
          currency: campaignData.currency || "ZAR",
          fixedAmount: Number(campaignData.fixedAmount) || 0,
          minRangeAmount: Number(campaignData.budgetFrom) || 0,
          maxRangeAmount: Number(campaignData.budgetTo) || 0,
          paymentTerms: campaignData.paymentTerms || "",
          allowBidsMarketPlace: campaignData.allowBidsMarketplace || false,
          applicationDeadline: campaignData.applicationDeadline || null,
          contentCreationDate: campaignData.contentCreationStart || null,
          contentCreationStart: campaignData.contentCreationStart || null,
          contentCreationEnd: campaignData.contentCreationEnd || null,
          bidsMarketPlace: {
            gender: campaignData.gender || "any",
            minFollowers: Number(campaignData.minFollowers) || 0,
            maxPrice:
              Number(campaignData.budgetTo) ||
              Number(campaignData.fixedAmount) ||
              0,
          },
        },

        // Tasks (nested object)
        tasks: {
          requiredDeliverables: campaignData.taskDeliverables.map((d) => ({
            platform: d.platform || "",
            type: d.type || "",
            details: d.details || "",
            dueDate: d.dueDate || "",
            status: "not started",
          })),
          dos: campaignData.dos || [],
          donts: campaignData.donts || [],
          metaData: {
            requiredHashTags: campaignData.requiredHashtags || [],
            mentions_or_tags: campaignData.mentionsTags || [],
          },
          questions: campaignData.screeningQuestions.map((q) => ({
            question: q.question || "",
            answers: q.answers.map((a) => a.text),
          })),
        },

        // Status — preserve published status when saving a previously published campaign
        status: draft
          ? wasPublished
            ? CampaignStatus.PUBLISHED
            : CampaignStatus.DRAFT
          : CampaignStatus.PUBLISHED,
      };

      // Update the campaign with all the data
      const response = await fetch(`/api/campaigns/${targetCampaignId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        if (draft) {
          toast.success(
            wasPublished
              ? "Campaign updated successfully!"
              : "Campaign saved as draft successfully!",
          );
          router.push("/brands/campaigns");
        } else {
          toast.success("Campaign published successfully!");
          router.push(`/brands/campaigns/${targetCampaignId}/dashboard`);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to save campaign:", errorData);
        toast.error(
          errorData.error ||
            `Failed to ${draft ? (wasPublished ? "update campaign" : "save draft") : "publish campaign"}`,
        );
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the campaign",
      );
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  const handleSaveAsDraft = () => {
    handleSubmit(true);
  };

  const renderStep = () => {
    const stepProps = {
      campaignData,
      setCampaignData: handleCampaignDataChange,
      errors,
      setErrors,
    };

    switch (step) {
      case 1:
        return <Step1Details {...stepProps} />;
      case 2:
        return <Step2Product {...stepProps} />;
      case 3:
        return <Step3Audience {...stepProps} />;
      case 4:
        return <Step4Budget {...stepProps} />;
      case 5:
        return <Step5Tasks {...stepProps} />;
      case 6:
        return <Step6Review {...stepProps} setStep={setStep} />;
      default:
        return null;
    }
  };

  // Show loading state while fetching draft
  if (loadingDraft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Show loading overlay while saving/uploading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium mb-2">
            {uploadProgress || "Saving campaign..."}
          </p>
          <p className="text-gray-500 text-sm">
            Please don&apos;t close this page
          </p>
        </div>
      </div>
    );
  }

 return (
    <div className="bg-gray-50">
      {/* Header Section - Matches MyCreatorsPage pattern */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-5xl mx-auto">
          {/* Header Content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                {isEditing
                  ? wasPublished
                    ? "Edit Campaign"
                    : "Edit Draft Campaign"
                  : "Create New Campaign"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Follow the steps to set up your influencer campaign brief.
              </p>
            </div>

            {/* Desktop Save Draft Button */}
            <button
              onClick={handleSaveAsDraft}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#E0E0E0] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditing
                ? wasPublished
                  ? "Update Campaign"
                  : "Update Draft"
                : "Save Draft"}
            </button>
          </div>

          {/* Back link */}
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-brand-navy-dark hover:text-brand-navy transition-colors text-sm font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Stepper - Desktop */}
          <div className="hidden sm:block mb-6">
            <ProgressStepper currentStep={step} steps={STEPS} />
          </div>

          {/* Progress Stepper - Mobile (Compact) */}
          <div className="sm:hidden mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">
                STEP {step} OF {STEPS.length}
              </span>
              <span className="text-xs text-gray-400">
                {STEPS[step - 1].label}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-brand-navy h-1.5 rounded-full transition-all"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Mobile Save Button */}
          <button
            onClick={handleSaveAsDraft}
            className="md:hidden w-full mb-6 py-3 border-2 border-brand-navy text-brand-navy rounded-xl font-bold text-base hover:bg-brand-navy hover:text-white transition-all"
          >
            {isEditing && wasPublished ? "Update Campaign" : "Save Draft"}
          </button>

          {/* Main Form Card */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm p-6 md:p-8 lg:p-10">
            {renderStep()}

            {/* Footer Buttons */}
            <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6 md:pt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`w-full md:w-auto px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold transition-all ${
                  step === 1
                    ? "opacity-0 pointer-events-none"
                    : "hover:bg-gray-50"
                }`}
              >
                Back
              </button>

              <div className="w-full md:w-auto">
                {step < 6 ? (
                  <button
                    onClick={handleNext}
                    className="w-full md:w-auto bg-brand-navy-dark text-white px-10 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy-light transition-all"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPublishConfirm(true)}
                    className="w-full md:w-auto bg-brand-navy-dark text-white px-10 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy transition-all"
                  >
                    Publish Campaign
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublishConfirmDialog
        isOpen={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={() => {
          setShowPublishConfirm(false);
          handleSubmit(false);
        }}
        campaignTitle={campaignData.title || "Untitled Campaign"}
      />
    </div>
  );
}
export default function CreateCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CreateCampaignContent />
    </Suspense>
  );
}
