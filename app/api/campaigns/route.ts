import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { requireBrandRole, requireAuth } from "@/lib/middleware/campaign-auth";
import { CampaignStatus } from "@/types/campaign";
import { validateCampaign } from "@/lib/validators/campaign-validators";

// Helper to serialize Firestore data (converts Timestamps to ISO strings)
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  if (data.toDate && typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        serialized[key] = serializeFirestoreData(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

// Helper to remove undefined values from an object (Firestore doesn't accept undefined)
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }

  return obj;
}

// validateCampaign is imported from @/lib/validators/campaign-validators

/**
 * Transform request body for Firestore
 */
function transformCampaignForFirestore(
  body: any,
  brandId: string,
  campaignId: string,
): any {
  const totalDeliverables = body.tasks?.requiredDeliverables?.length || 0;

  return {
    // Core Identity
    id: campaignId,
    brandId,
    status: body.status || CampaignStatus.DRAFT,

    // Basic Info
    campaignTitle: body.campaignTitle || "",
    campaignVisibility: body.campaignVisibility || "public",
    campaignObjectives: Array.isArray(body.campaignObjectives)
      ? body.campaignObjectives
      : [],
    campaignCategories: Array.isArray(body.campaignCategories)
      ? body.campaignCategories
      : [],
    kpi: body.kpi || "",
    description: body.description || "",

    // File Attachments
    campaignAssets: body.campaignAssets || [],
    campaignMoodBoard: body.campaignMoodBoard || [],
    campaignBrief: body.campaignBrief || [],
    campaignContract: body.campaignContract || [],

    // Timeline
    campaignStart: body.campaignStart ? new Date(body.campaignStart) : null,
    campaignEnd: body.campaignEnd ? new Date(body.campaignEnd) : null,

    // Product Info
    campaignProduct: {
      productType: body.campaignProduct?.productType || "",
      productName: body.campaignProduct?.productName || "",
      productImagesUrls: body.campaignProduct?.productImagesUrls || [],
      productValue: Number(body.campaignProduct?.productValue) || 0,
      productLink: body.campaignProduct?.productLink || "",
      willReimburse_or_productShipped:
        body.campaignProduct?.willReimburse_or_productShipped || false,
      keepsProduct: body.campaignProduct?.keepsProduct || false,
      reimburseAmount: Number(body.campaignProduct?.reimburseAmount) || 0,
    },

    // Audience
    audience: {
      ageMin: Number(body.audience?.ageMin) || 18,
      ageMax: Number(body.audience?.ageMax) || 65,
      gender: body.audience?.gender || "any",
      targetLocation: body.audience?.targetLocation || "",
      interests_and_affiliates: Array.isArray(
        body.audience?.interests_and_affiliates,
      )
        ? body.audience.interests_and_affiliates
        : typeof body.audience?.interests_and_affiliates === "string"
          ? body.audience.interests_and_affiliates
              .split(",")
              .map((i: string) => i.trim())
              .filter(Boolean)
          : [],
      minFollowers: Number(body.audience?.minFollowers) || 0,
      minEngagements: Number(body.audience?.minEngagements) || 0,
    },

    // Budget
    budget: {
      compensationModel: body.budget?.compensationModel || "fixed",
      currency: body.budget?.currency || "ZAR",
      fixedAmount: Number(body.budget?.fixedAmount) || 0,
      minRangeAmount: Number(body.budget?.minRangeAmount) || 0,
      maxRangeAmount: Number(body.budget?.maxRangeAmount) || 0,
      paymentTerms: body.budget?.paymentTerms || "",
      allowBidsMarketPlace: body.budget?.allowBidsMarketPlace || false,
      applicationDeadline: body.budget?.applicationDeadline
        ? new Date(body.budget.applicationDeadline)
        : null,
      contentCreationDate: body.budget?.contentCreationDate
        ? new Date(body.budget.contentCreationDate)
        : null,
      contentCreationStart: body.budget?.contentCreationStart
        ? new Date(body.budget.contentCreationStart)
        : null,
      contentCreationEnd: body.budget?.contentCreationEnd
        ? new Date(body.budget.contentCreationEnd)
        : null,
      bidsMarketPlace: {
        gender: body.budget?.bidsMarketPlace?.gender || "any",
        minFollowers: Number(body.budget?.bidsMarketPlace?.minFollowers) || 0,
        maxPrice: Number(body.budget?.bidsMarketPlace?.maxPrice) || 0,
      },
    },

    // Tasks
    tasks: {
      // Map through deliverables to ensure they have an initial status
      requiredDeliverables: (body.tasks?.requiredDeliverables || []).map(
        (deliverable: any) => ({
          ...deliverable,
          // Ensure status exists; default to 'not started' if not provided
          // status: deliverable.status || "not started",
        }),
      ),
      dos: body.tasks?.dos || [],
      donts: body.tasks?.donts || [],
      metaData: {
        requiredHashTags: Array.isArray(body.tasks?.metaData?.requiredHashTags)
          ? body.tasks.metaData.requiredHashTags
          : [],
        mentions_or_tags: Array.isArray(body.tasks?.metaData?.mentions_or_tags)
          ? body.tasks.metaData.mentions_or_tags
          : [],
      },
      questions: body.tasks?.questions || [],
    },

    // Stats
    stats: {
      views: 0,
      applications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      pendingApplications: 0,
      completedDeliverables: 0,
      totalDeliverables,
    },

    // System Fields
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function POST(req: Request) {
  return requireBrandRole(async (decodedToken) => {
    try {
      const brandId = decodedToken.uid;
      const body = await req.json();

      const isDraft = body.isDraft === true || body.status === "DRAFT";

      // Validate
      const validationErrors = validateCampaign(body, isDraft);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing or invalid fields: ${validationErrors.join(", ")}`,
            missingFields: validationErrors,
          },
          { status: 400 },
        );
      }

      // Create campaign
      const newCampaignRef = firestore.collection("campaigns").doc();
      const newCampaign = transformCampaignForFirestore(
        body,
        brandId,
        newCampaignRef.id,
      );
      const cleanedCampaign = removeUndefined(newCampaign);

      await newCampaignRef.set(cleanedCampaign);

      return NextResponse.json({
        success: true,
        data: serializeFirestoreData(cleanedCampaign),
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create campaign" },
        { status: 500 },
      );
    }
  });
}

export async function GET(req: Request) {
  return requireAuth(async (decodedToken) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = decodedToken.uid;

      // Get user role
      const userDoc = await firestore.collection("users").doc(userId).get();
      const userRole = userDoc.data()?.role;

      let campaignsQuery:
        | FirebaseFirestore.Query
        | FirebaseFirestore.CollectionReference =
        firestore.collection("campaigns");

      if (userRole === "brand") {
        // Brands see their own campaigns
        campaignsQuery = campaignsQuery.where("brandId", "==", userId);
      } else {
        // Creators see published campaigns
        campaignsQuery = campaignsQuery.where("status", "==", "PUBLISHED");
      }

      const snapshot = await campaignsQuery.get();
      const campaigns = snapshot.docs.map((doc) => ({
        ...serializeFirestoreData(doc.data()),
        id: doc.id,
      }));

      return NextResponse.json({ success: true, data: { campaigns } });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch campaigns" },
        { status: 500 },
      );
    }
  });
}
