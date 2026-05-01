import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'LinkPulse API',
    version: '1.0.0',
    description: 'Short links and analytics API documentation.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Links' },
    { name: 'Redirect' },
    { name: 'Analytics' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ValidationErrorDetail: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'body.email' },
          message: { type: 'string', example: 'Invalid email address' },
        },
        required: ['message'],
      },
      ApiError: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 400 },
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Invalid request data' },
          details: {
            type: 'array',
            items: { $ref: '#/components/schemas/ValidationErrorDetail' },
          },
        },
        required: ['statusCode', 'error', 'message', 'details'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Igor Silva' },
          email: { type: 'string', format: 'email', example: 'igor@email.com' },
        },
        required: ['id', 'name', 'email'],
      },
      AuthRegisterRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          email: { type: 'string', format: 'email', maxLength: 180 },
          password: { type: 'string', minLength: 5, maxLength: 60 },
        },
        required: ['name', 'email', 'password'],
      },
      AuthLoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthLoginResponse: {
        type: 'object',
        properties: {
          acessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          tokenType: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'integer', example: 3600 },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['acessToken', 'tokenType', 'expiresIn', 'user'],
      },
      Link: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          originalUrl: { type: 'string', format: 'uri' },
          shortCode: { type: 'string', example: 'Ab3dE9x' },
          customAlias: { type: 'string', nullable: true, example: 'promo_2026' },
          shortUrl: { type: 'string', format: 'uri', example: 'http://localhost:3000/r/Ab3dE9x' },
          title: { type: 'string', nullable: true, example: 'Campaign Landing' },
          description: { type: 'string', nullable: true, example: 'Main campaign link' },
          active: { type: 'boolean', example: true },
          expired: { type: 'boolean', example: false },
          reachedMaxClicks: { type: 'boolean', example: false },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          maxClicks: { type: 'integer', nullable: true, example: 5000 },
          clickCount: { type: 'integer', example: 221 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'originalUrl',
          'shortCode',
          'customAlias',
          'shortUrl',
          'title',
          'description',
          'active',
          'expired',
          'reachedMaxClicks',
          'expiresAt',
          'maxClicks',
          'clickCount',
          'createdAt',
          'updatedAt',
        ],
      },
      CreateLinkRequest: {
        type: 'object',
        properties: {
          originalUrl: { type: 'string', format: 'uri' },
          customAlias: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$', minLength: 3, maxLength: 50 },
          title: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 500 },
          expiresAt: { type: 'string', format: 'date-time' },
          maxClicks: { type: 'integer', minimum: 1 },
        },
        required: ['originalUrl'],
      },
      UpdateLinkRequest: {
        type: 'object',
        properties: {
          originalUrl: { type: 'string', format: 'uri' },
          customAlias: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$', minLength: 3, maxLength: 50 },
          title: { type: 'string', nullable: true, maxLength: 120 },
          description: { type: 'string', nullable: true, maxLength: 500 },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          maxClicks: { type: 'integer', minimum: 1, nullable: true },
          active: { type: 'boolean' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalItems: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
        required: ['page', 'limit', 'totalItems', 'totalPages'],
      },
      LinkListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Link' },
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
        required: ['data', 'pagination'],
      },
      AnalyticsSummary: {
        type: 'object',
        properties: {
          linkId: { type: 'string', format: 'uuid' },
          shortCode: { type: 'string', example: 'Ab3dE9x' },
          totalClicks: { type: 'integer', example: 543 },
          clicksToday: { type: 'integer', example: 12 },
          clicksLast7Days: { type: 'integer', example: 97 },
          lastAccessAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['linkId', 'shortCode', 'totalClicks', 'clicksToday', 'clicksLast7Days', 'lastAccessAt'],
      },
      ClicksByDayItem: {
        type: 'object',
        properties: {
          date: { type: 'string', example: '2026-05-01' },
          clicks: { type: 'integer', example: 34 },
        },
        required: ['date', 'clicks'],
      },
      AccessEvent: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          accessedAt: { type: 'string', format: 'date-time' },
          ipAddress: { type: 'string', nullable: true, example: '203.0.113.9' },
          userAgent: { type: 'string', nullable: true, example: 'Mozilla/5.0' },
          referer: { type: 'string', nullable: true, example: 'https://google.com' },
        },
        required: ['id', 'accessedAt', 'ipAddress', 'userAgent', 'referer'],
      },
      TopLink: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', nullable: true, example: 'Campaign Landing' },
          shortCode: { type: 'string', example: 'Ab3dE9x' },
          shortUrl: { type: 'string', format: 'uri', example: 'http://localhost:3000/r/Ab3dE9x' },
          clickCount: { type: 'integer', example: 2711 },
        },
        required: ['id', 'title', 'shortCode', 'shortUrl', 'clickCount'],
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: {
              statusCode: 400,
              error: 'Bad Request',
              message: 'Invalid request data',
              details: [{ field: 'body.email', message: 'Invalid email address' }],
            },
          },
        },
      },
      UnauthorizedError: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: {
              statusCode: 401,
              error: 'Unauthorized',
              message: 'Invalid or expired token',
              details: [],
            },
          },
        },
      },
      NotFoundError: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: {
              statusCode: 404,
              error: 'Not Found',
              message: 'Link not found.',
              details: [],
            },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: {
              statusCode: 429,
              error: 'Too Many Requests',
              message: 'Too many requests. Please try again later.',
              details: [],
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
              example: { name: 'Igor Silva', email: 'igor@email.com', password: 'secret123' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: {
                  statusCode: 409,
                  error: 'Conflict',
                  message: 'Email already registered',
                  details: [],
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
              example: { email: 'igor@email.com', password: 'secret123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/v1/links': {
      post: {
        tags: ['Links'],
        summary: 'Create short link',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateLinkRequest' },
              example: {
                originalUrl: 'https://docs.linkpulse.dev/onboarding',
                customAlias: 'onboarding',
                title: 'Onboarding',
                description: 'Internal onboarding docs',
                expiresAt: '2026-12-31T23:59:59.000Z',
                maxClicks: 5000,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Link' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: {
                  statusCode: 409,
                  error: 'Conflict',
                  message: 'This alias is already in use.',
                  details: [],
                },
              },
            },
          },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
      get: {
        tags: ['Links'],
        summary: 'List links',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'active', in: 'query', schema: { type: 'boolean' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'clickCount', 'title'], default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LinkListResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/v1/links/{id}': {
      get: {
        tags: ['Links'],
        summary: 'Get link by id',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Link' } } },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Links'],
        summary: 'Update link',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateLinkRequest' },
              example: {
                title: 'Updated title',
                description: 'Updated description',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Link' } } },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: {
                  statusCode: 409,
                  error: 'Conflict',
                  message: 'This short code is already in use.',
                  details: [],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Links'],
        summary: 'Delete link',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          204: { description: 'No Content' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/links/{id}/activate': {
      patch: {
        tags: ['Links'],
        summary: 'Activate link',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Link' } } },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/links/{id}/deactivate': {
      patch: {
        tags: ['Links'],
        summary: 'Deactivate link',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Link' } } },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/r/{shortCode}': {
      get: {
        tags: ['Redirect'],
        summary: 'Redirect by short code',
        parameters: [{ name: 'shortCode', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          302: {
            description: 'Found',
            headers: {
              Location: {
                description: 'Original URL',
                schema: { type: 'string', format: 'uri' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFoundError' },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/v1/links/{id}/analytics/summary': {
      get: {
        tags: ['Analytics'],
        summary: 'Get link analytics summary',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnalyticsSummary' },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/links/{id}/analytics/clicks-by-day': {
      get: {
        tags: ['Analytics'],
        summary: 'Get clicks by day',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date', example: '2026-04-25' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date', example: '2026-05-01' } },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ClicksByDayItem' },
                },
                example: [
                  { date: '2026-04-30', clicks: 9 },
                  { date: '2026-05-01', clicks: 12 },
                ],
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/links/{id}/analytics/events': {
      get: {
        tags: ['Analytics'],
        summary: 'Get paginated access events',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AccessEvent' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                  required: ['data', 'pagination'],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/analytics/top-links': {
      get: {
        tags: ['Analytics'],
        summary: 'Get top links',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TopLink' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
  },
} as const

export const openApiSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
})

export const swaggerServe = swaggerUi.serve
export const swaggerSetup = swaggerUi.setup(openApiSpec)
