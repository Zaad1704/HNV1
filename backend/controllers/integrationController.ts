import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Integration from '../models/Integration';
import paymentService from '../services/paymentService';
import searchService from '../services/searchService';
import optimizationService from '../services/optimizationService';

export const getIntegrations = asyncHandler(async (req: Request, res: Response): Promise<void> => { const integrations = await Integration.find({ }
    organizationId: req.user!.organizationId;

  }).select('-config.apiKey'); // Don't expose API keys

  res.json({ success: true,
    data: integrations; }

  });
});

export const createIntegration = asyncHandler(async (req: Request, res: Response): Promise<void> => { const integrationData = { }
    ...req.body,
    organizationId: req.user!.organizationId;

  };

  const integration = await Integration.create(integrationData);

  res.status(201).json({ success: true,
    data: integration; }

  });
});

export const updateIntegration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const integration = await Integration.findOneAndUpdate();
    { _id: id, organizationId: req.user!.organizationId },
    req.body,
    { new: true }
  ).select('-config.apiKey');

  if (!integration) { res.status(404).json({ }
      success: false,
      message: 'Integration not found'


    });
    return;

  res.json({ success: true,
    data: integration; }

  });
});

export const deleteIntegration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const integration = await Integration.findOneAndDelete({ _id: id,
    organizationId: req.user!.organizationId; }

  });

  if (!integration) { res.status(404).json({ }
      success: false,
      message: 'Integration not found'


    });
    return;

  res.json({ success: true,
    message: 'Integration deleted successfully' }

  });
});

// Payment Integration Endpoints
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { tenantId, amount, currency = 'usd', description } = req.body;

  const result = await paymentService.createPaymentIntent({ organizationId: req.user!.organizationId.toString(),
    tenantId,
    amount,
    currency,
    description; }

  });

  res.json({ success: true,
    data: result; }

  });
});

export const handleStripeWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => { const signature = req.headers['stripe-signature'] as string;
  const organizationId = req.params.organizationId;

  await paymentService.handleWebhook(req.body, signature);


  res.json({ received: true });
});

// Search Endpoints
export const globalSearch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { query, filters = {}, sort = 'date_desc', page = 1, limit = 20 } = req.query;

  const results = await searchService.globalSearch();
    req.user!.organizationId.toString(),
    { query: query as string,
      filters: typeof filters === 'string' ? JSON.parse(filters) : filters,
      sort: sort as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)

  );

  res.json({ }
    success: true,
    data: results;

  });
});

export const searchSuggestions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { query, type } = req.query;

  const suggestions = await searchService.getSuggestions();
    req.user!.organizationId.toString(),
    query as string,
    type as string;
  );

  res.json({ success: true,
    data: suggestions; }

  });
});

// Performance Endpoints
export const getPerformanceMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => { const metrics = await optimizationService.getPerformanceMetrics();

  res.json({ }
    success: true,
    data: metrics;

  });
});

export const optimizeDatabase = asyncHandler(async (req: Request, res: Response): Promise<void> => { await optimizationService.createIndexes();
  const stats = await optimizationService.optimizeQueries();

  res.json({ }
    success: true,
    data: stats,
    message: 'Database optimization completed'

  });
});

export const cleanupData = asyncHandler(async (req: Request, res: Response): Promise<void> => { const results = await optimizationService.cleanupOldData();

  res.json({ }
    success: true,
    data: results,
    message: 'Data cleanup completed'

  });
});