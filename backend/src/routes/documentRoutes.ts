/**
 * Document Intelligence API Routes
 *
 * REST API endpoints for accessing OSH document intelligence features.
 * These endpoints provide precise document information for interview scenarios.
 */

import { Router, Request, Response } from 'express';
import { documentIntelligence } from '../services/documentIntelligenceService';
import { intelligentResponse } from '../services/intelligentResponseService';

const router = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Initialize services on first request
let initialized = false;
const ensureInitialized = async (req: Request, res: Response, next: Function) => {
  if (!initialized) {
    try {
      await documentIntelligence.initialize();
      await intelligentResponse.initialize();
      initialized = true;
    } catch (error) {
      console.error('[DocumentRoutes] Failed to initialize:', error);
      return res.status(500).json({
        success: false,
        error: 'Document intelligence service unavailable'
      });
    }
  }
  next();
};

router.use(ensureInitialized);

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/documents
 * List all available documents
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const documents = await documentIntelligence.getAvailableDocuments();
    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error listing documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list documents'
    });
  }
});

/**
 * GET /api/documents/:documentId
 * Get document information and statistics
 */
router.get('/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const info = await intelligentResponse.getDocumentInfo(documentId);

    if (!info.found) {
      return res.status(404).json({
        success: false,
        error: `Document not found: ${documentId}`
      });
    }

    res.json({
      success: true,
      document: info.stats,
      hasFullText: !!info.fullText
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error getting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document'
    });
  }
});

/**
 * GET /api/documents/:documentId/full
 * Get full document text
 */
router.get('/:documentId/full', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const fullText = await documentIntelligence.getFullDocumentText(documentId);

    if (!fullText) {
      return res.status(404).json({
        success: false,
        error: `Document not found: ${documentId}`
      });
    }

    res.json({
      success: true,
      documentId,
      fullText
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error getting full text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get full document text'
    });
  }
});

/**
 * GET /api/documents/:documentId/sections
 * Get list of sections for a document
 */
router.get('/:documentId/sections', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const info = await intelligentResponse.getDocumentInfo(documentId);

    if (!info.found || !info.stats) {
      return res.status(404).json({
        success: false,
        error: `Document not found: ${documentId}`
      });
    }

    res.json({
      success: true,
      documentId,
      title: info.stats.title,
      sectionCount: info.stats.sectionCount,
      sections: info.stats.sections
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error getting sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sections'
    });
  }
});

/**
 * GET /api/documents/:documentId/sections/:sectionNumber
 * Get specific section content with citation
 */
router.get('/:documentId/sections/:sectionNumber', async (req: Request, res: Response) => {
  try {
    const { documentId, sectionNumber } = req.params;
    const section = await intelligentResponse.getSectionContent(documentId, sectionNumber);

    if (!section.found) {
      return res.status(404).json({
        success: false,
        error: `Section ${sectionNumber} not found in ${documentId}`
      });
    }

    res.json({
      success: true,
      documentId,
      sectionNumber,
      title: section.title,
      content: section.content,
      citation: section.citation
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error getting section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get section'
    });
  }
});

/**
 * POST /api/documents/query
 * Process a natural language query about OSH documents
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { question, documentHint, requiresExactCitation } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const response = await documentIntelligence.processQuery({
      question,
      documentHint,
      requiresExactCitation
    });

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error processing query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query'
    });
  }
});

/**
 * POST /api/documents/search
 * Search across all documents
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await intelligentResponse.searchDocuments(query, limit);

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error searching:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search documents'
    });
  }
});

/**
 * POST /api/documents/analyze
 * Analyze a question to determine if document intelligence is needed
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const analysis = intelligentResponse.analyzeQuestion(question);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error analyzing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze question'
    });
  }
});

/**
 * POST /api/documents/enhance
 * Get an enhanced response combining AI and document intelligence
 */
router.post('/enhance', async (req: Request, res: Response) => {
  try {
    const { question, aiResponse } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const enhanced = await intelligentResponse.getEnhancedResponse(question, aiResponse);

    res.json({
      success: true,
      enhanced
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error enhancing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enhance response'
    });
  }
});

/**
 * GET /api/documents/citation/:documentId/:sectionNumber?
 * Get a properly formatted citation
 */
router.get('/citation/:documentId/:sectionNumber?', async (req: Request, res: Response) => {
  try {
    const { documentId, sectionNumber } = req.params;

    const response = await documentIntelligence.processQuery({
      question: `Give me the citation for ${sectionNumber ? `Section ${sectionNumber} of ` : ''}${documentId}`,
      documentHint: documentId,
      requiresExactCitation: true
    });

    res.json({
      success: true,
      citation: response.citation,
      formattedCitation: response.answer
    });
  } catch (error) {
    console.error('[DocumentRoutes] Error getting citation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get citation'
    });
  }
});

export default router;
