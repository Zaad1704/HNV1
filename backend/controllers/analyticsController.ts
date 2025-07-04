import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import analyticsService from '../services/analyticsService';

export const getCollectionAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const organizationId = req.user!.organizationId.toString();

  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate as string) : new Date();

  const analytics = await analyticsService.generateCollectionAnalytics(organizationId, start, end);

  res.json({
    success: true,
    data: analytics
  });
});

export const getCollectionTrends = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { months = 12 } = req.query;
  const organizationId = req.user!.organizationId.toString();

  const trends = await analyticsService.getCollectionTrends(organizationId, parseInt(months as string));

  res.json({
    success: true,
    data: trends
  });
});

export const getPropertyPerformance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();

  const performance = await analyticsService.getPropertyPerformance(organizationId);

  res.json({
    success: true,
    data: performance
  });
});

export const getTenantRiskAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();

  const riskAnalysis = await analyticsService.getTenantRiskAnalysis(organizationId);

  res.json({
    success: true,
    data: riskAnalysis
  });
});

export const getDashboardMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const [analytics, trends, propertyPerformance, tenantRisks] = await Promise.all([
    analyticsService.generateCollectionAnalytics(organizationId, startOfMonth, endOfMonth),
    analyticsService.getCollectionTrends(organizationId, 6),
    analyticsService.getPropertyPerformance(organizationId),
    analyticsService.getTenantRiskAnalysis(organizationId)
  ]);

  res.json({
    success: true,
    data: {
      currentMonth: analytics,
      trends: trends.slice(-6), // Last 6 months
      topProperties: propertyPerformance.slice(0, 5),
      highRiskTenants: tenantRisks.filter((t: any) => t.riskScore === 'high').slice(0, 10)

  });
});