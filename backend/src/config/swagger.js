const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuickCart Secure Ecommerce API',
      version: '1.0.0',
      description: 'Interactive API documentation for QuickCart secure ecommerce backend. Note: Login uses HttpOnly cookies. Once logged in inside the Swagger UI, the browser automatically stores the session cookie, allowing all protected routes to be directly tested from this interface. Strictly active under development environments.',
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Health', description: 'API Health Check Status' },
      { name: 'Auth', description: 'User Registration and Authentication Session Gates' },
      { name: 'Users', description: 'Customer Profiles and Admin Queries' },
      { name: 'Products', description: 'Catalog Products CRUD & Image Uploads (Admin Protected)' },
      { name: 'Categories', description: 'Public Catalog Category Queries' },
      { name: 'Cart', description: 'Customer Shopping Cart Operations (Session Gated)' },
      { name: 'Orders', description: 'Customer Checkouts and Admin Order Management (Session Gated)' },
      { name: 'Audit', description: 'Security and Audit Log Queries (Admins Only)' },
      { name: 'Settings', description: 'Development Configurations settings (Admins Only)' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Get backend service health status',
          description: 'Returns the operational health and general configuration status of the QuickCart backend API service.',
          responses: {
            200: {
              description: 'Service is healthy.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'QuickCart API is running.' },
                      data: {
                        type: 'object',
                        properties: {
                          service: { type: 'string', example: 'QuickCart Backend' },
                          status: { type: 'string', example: 'healthy' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new customer profile',
          description: 'Saves a new shopper profile in the database. Role default forced to USER. Validates strict pass standards.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password', 'firstName', 'lastName'],
                  properties: {
                    username: { type: 'string', minLength: 3, maxLength: 30, example: 'john_doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', format: 'password', example: 'Secure@12345' },
                    firstName: { type: 'string', maxLength: 50, example: 'John' },
                    lastName: { type: 'string', maxLength: 50, example: 'Doe' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Customer registered successfully. Password is hashed securely.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User registered successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'd3b07384-d113-4ec2-a5d6-848834924c57' },
                          username: { type: 'string', example: 'john_doe' },
                          email: { type: 'string', example: 'john@example.com' },
                          firstName: { type: 'string', example: 'John' },
                          lastName: { type: 'string', example: 'Doe' },
                          role: { type: 'string', example: 'USER' },
                          isActive: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Validation failed or duplicate username/email details.' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate credentials and start session',
          description: 'Validates credentials and responds with JWT token sealed inside HttpOnly cookie (named quickcart_token). The JWT is never returned in the JSON body for maximum security.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['usernameOrEmail', 'password'],
                  properties: {
                    usernameOrEmail: { type: 'string', example: 'john_doe' },
                    password: { type: 'string', example: 'Secure@12345' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful. Cookie has been set.',
              headers: {
                'Set-Cookie': {
                  schema: { type: 'string', example: 'quickcart_token=eyJhbGciOi...; Path=/; HttpOnly; SameSite=Lax' }
                }
              },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful.' },
                      data: {
                        type: 'object',
                        properties: {
                          user: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'd3b07384-d113-4ec2-a5d6-848834924c57' },
                              username: { type: 'string', example: 'john_doe' },
                              email: { type: 'string', example: 'john@example.com' },
                              role: { type: 'string', example: 'USER' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Generic invalid username or password error.' }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Clear authentication cookie session',
          description: 'Clears the quickcart_token HttpOnly cookie on the client side.',
          responses: {
            200: {
              description: 'Logout successful. Session cookie cleared.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Logout successful.' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get active session shopper profile info',
          description: 'Retrieves profile metadata bound to the active HttpOnly session.',
          responses: {
            200: {
              description: 'Profile resolved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Current user profile retrieved.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'd3b07384-d113-4ec2-a5d6-848834924c57' },
                          username: { type: 'string', example: 'john_doe' },
                          email: { type: 'string', example: 'john@example.com' },
                          role: { type: 'string', example: 'USER' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Session missing or expired.' }
          }
        }
      },
      '/users/profile': {
        get: {
          tags: ['Users'],
          summary: 'Query current customer profile details',
          description: 'Returns the shopper sanitized data structure matching active session identifiers.',
          responses: {
            200: {
              description: 'Profile resolved.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User profile retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'd3b07384-d113-4ec2-a5d6-848834924c57' },
                          username: { type: 'string', example: 'john_doe' },
                          email: { type: 'string', example: 'john@example.com' },
                          firstName: { type: 'string', example: 'John' },
                          lastName: { type: 'string', example: 'Doe' },
                          role: { type: 'string', example: 'USER' },
                          isActive: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' }
          }
        },
        patch: {
          tags: ['Users'],
          summary: 'Modify shopper profile fields',
          description: 'Permits updating only firstName, lastName, and email. Any attempts to inject other attributes are strictly rejected.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string', maxLength: 50, example: 'Johnny' },
                    lastName: { type: 'string', maxLength: 50, example: 'Doe' },
                    email: { type: 'string', format: 'email', example: 'johnny@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Shopper profile modified successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User profile updated successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'd3b07384-d113-4ec2-a5d6-848834924c57' },
                          username: { type: 'string', example: 'john_doe' },
                          email: { type: 'string', example: 'johnny@example.com' },
                          firstName: { type: 'string', example: 'Johnny' },
                          lastName: { type: 'string', example: 'Doe' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Strict validation mismatch or duplicate email error.' },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all product categories',
          description: 'Public endpoint listing all categories sorted by name ascending, with product counts.',
          responses: {
            200: {
              description: 'Categories list resolved.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Categories retrieved successfully.' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'ca3a9254-001a-4d76-80cc-4089c8942b03' },
                            name: { type: 'string', example: 'Gaming' },
                            slug: { type: 'string', example: 'gaming' },
                            description: { type: 'string', example: 'Gaming peripherals...' },
                            productCount: { type: 'integer', example: 3 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List public products',
          description: 'Lists only active products (isActive: true) by default. Supports paginated search, category filters, and sorting parameters.',
          parameters: [
            { name: 'search', in: 'query', description: 'Filter products by text contains matches in name or description', schema: { type: 'string' } },
            { name: 'category', in: 'query', description: 'Filter by Category slug or UUID categoryId', schema: { type: 'string' } },
            { name: 'sort', in: 'query', description: 'Sort criteria: newest, price_asc, price_desc, name_asc', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page index', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items count limit per page', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Products list resolved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Products retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          products: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: 'a9092cd4-3c8c-4f76-807d-5a8b7c8449c2' },
                                name: { type: 'string', example: 'Wireless Gaming Mouse' },
                                slug: { type: 'string', example: 'wireless-gaming-mouse' },
                                description: { type: 'string', example: 'High-precision 16000 DPI...' },
                                price: { type: 'number', example: 79.99 },
                                stock: { type: 'integer', example: 45 },
                                imageName: { type: 'string', example: 'some-uuid-image.png' },
                                imageUrl: { type: 'string', example: '/uploads/products/some-uuid-image.png' }
                              }
                            }
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              total: { type: 'integer', example: 1 },
                              page: { type: 'integer', example: 1 },
                              limit: { type: 'integer', example: 10 },
                              totalPages: { type: 'integer', example: 1 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product (Admin Only)',
          description: 'Adds a new product catalog record. Slug is auto-generated uniquely. Protected strictly by ADMIN RBAC.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'price', 'stock', 'categoryId'],
                  properties: {
                    name: { type: 'string', minLength: 2, maxLength: 120, example: 'Wireless Gaming Mouse' },
                    description: { type: 'string', maxLength: 2000, example: 'High-precision mouse' },
                    price: { type: 'number', minimum: 0.01, example: 79.99 },
                    stock: { type: 'integer', minimum: 0, example: 45 },
                    categoryId: { type: 'string', format: 'uuid', example: 'ca3a9254-001a-4d76-80cc-4089c8942b03' },
                    isActive: { type: 'boolean', default: true }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Product created successfully.' },
            400: { description: 'Invalid category or schema validation failure.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden. Insufficient permissions.' }
          }
        }
      },
      '/products/{idOrSlug}': {
        get: {
          tags: ['Products'],
          summary: 'Query product details',
          description: 'Retrieves an active product profile specifications matching its UUID ID or URL Slug.',
          parameters: [
            { name: 'idOrSlug', in: 'path', required: true, description: 'Product UUID or URL-safe slug', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Product retrieved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Product details retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'a9092cd4-3c8c-4f76-807d-5a8b7c8449c2' },
                          name: { type: 'string', example: 'Wireless Gaming Mouse' },
                          slug: { type: 'string', example: 'wireless-gaming-mouse' },
                          price: { type: 'number', example: 79.99 }
                        }
                      }
                    }
                  }
                }
              }
            },
            404: { description: 'Product not found.' }
          }
        }
      },
      '/products/{id}': {
        patch: {
          tags: ['Products'],
          summary: 'Modify catalog product parameters (Admin Only)',
          description: 'Updates specified product properties. Re-generates slug safely if product name changes. Gated behind ADMIN RBAC.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Product UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 2, maxLength: 120, example: 'Improved Mechanical Keyboard' },
                    price: { type: 'number', example: 89.99 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Product details modified successfully.' },
            400: { description: 'Validation fails or empty parameters.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' },
            404: { description: 'Product not found.' }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Soft delete product entry (Admin Only)',
          description: 'Toggles product active state to false, keeping the product inside database to protect relational Order history logs. Gated behind ADMIN RBAC.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Product UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Product soft deleted successfully.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' },
            404: { description: 'Product not found.' }
          }
        }
      },
      '/products/{id}/image': {
        post: {
          tags: ['Products'],
          summary: 'Upload and map product image file (Admin Only)',
          description: 'Uploads a JPG, JPEG, PNG, or WebP image under multipart/form-data. Discards the original client filename, renames utilizing secure random UUID, and stores locally. Excludes leaking internal absolute paths. Gated behind ADMIN RBAC.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Product UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Product image asset file (Max size based on env configuration)' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Image uploaded and mapped successfully.' },
            400: { description: 'Incorrect file extension, large file, or parsing failure.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' },
            404: { description: 'Product not found.' }
          }
        }
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Query customer shopping cart',
          description: 'Returns the list of shopping cart items belonging to the authenticated user, complete with subtotals, overall sums, and total counts. Automatically strips imagePaths and filters out inactive products.',
          responses: {
            200: {
              description: 'Shopper cart resolved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Shopping cart retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          items: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: 'c0a9b254-001a-4d76-80cc-4089c8942b03' },
                                productId: { type: 'string', example: 'a9092cd4-3c8c-4f76-807d-5a8b7c8449c2' },
                                quantity: { type: 'integer', example: 2 },
                                subtotal: { type: 'number', example: 159.98 },
                                product: { type: 'object' }
                              }
                            }
                          },
                          cartTotal: { type: 'number', example: 159.98 },
                          totalItemsCount: { type: 'integer', example: 2 }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add or increment a product inside shopping cart',
          description: 'Appends a product into the shopper cart, validating stock levels and active status in real-time. Increments quantities if the item already exists in the cart.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId', 'quantity'],
                  properties: {
                    productId: { type: 'string', format: 'uuid', description: 'Product UUID ID', example: 'a9092cd4-3c8c-4f76-807d-5a8b7c8449c2' },
                    quantity: { type: 'integer', minimum: 1, maximum: 99, example: 2 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Item added/incremented successfully. Returns updated cart.' },
            400: { description: 'Out of stock, inactive product, or validation error.' },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/cart/items/{id}': {
        patch: {
          tags: ['Cart'],
          summary: 'Modify item quantity in cart',
          description: 'Saves a new quantity for a cart item. Enforces direct ownership check to prevent Insecure Direct Object Reference (IDOR) attacks.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Cart item UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    quantity: { type: 'integer', minimum: 1, maximum: 99, example: 5 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Quantity updated successfully. Returns updated cart.' },
            400: { description: 'Validation fails or quantity exceeds available stock bounds.' },
            401: { description: 'Unauthenticated.' },
            404: { description: 'Cart item not found or doesn\'t belong to user (IDOR prevention).' }
          }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Remove an item from cart',
          description: 'Removes a specific product from the shopper cart. Enforces direct ownership check to block IDOR attacks.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Cart item UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Item removed successfully. Returns updated cart.' },
            401: { description: 'Unauthenticated.' },
            404: { description: 'Cart item not found or doesn\'t belong to user (IDOR prevention).' }
          }
        }
      },
      '/cart/clear': {
        delete: {
          tags: ['Cart'],
          summary: 'Completely empty shopper cart',
          description: 'Removes all items associated with the authenticated user\'s shopping cart.',
          responses: {
            200: {
              description: 'Cart emptied successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Shopping cart cleared successfully.' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/orders/checkout': {
        post: {
          tags: ['Orders'],
          summary: 'Checkout and place a simulated order',
          description: 'Places a simulated order using active shopping cart items. Stock is atomically reduced and cart is cleared. Employs transaction safeguards. Payment details are prohibited.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'],
                  properties: {
                    fullName: { type: 'string', minLength: 2, maxLength: 120, example: 'Jane Doe' },
                    phone: { type: 'string', minLength: 8, maxLength: 20, example: '+1234567890' },
                    addressLine1: { type: 'string', minLength: 5, maxLength: 200, example: '123 Main Street' },
                    addressLine2: { type: 'string', maxLength: 200, example: 'Apt 4B' },
                    city: { type: 'string', minLength: 2, maxLength: 100, example: 'New York' },
                    state: { type: 'string', minLength: 2, maxLength: 100, example: 'NY' },
                    postalCode: { type: 'string', minLength: 3, maxLength: 20, example: '10001' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Checkout complete. Simulated order placed successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Checkout completed successfully. Order placed.' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'b0a9b254-001a-4d76-80cc-4089c8942b03' },
                          status: { type: 'string', example: 'PENDING' },
                          totalAmount: { type: 'number', example: 159.98 },
                          fullName: { type: 'string', example: 'Jane Doe' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Empty cart, schema mismatch, or out of stock items.' },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/orders/my': {
        get: {
          tags: ['Orders'],
          summary: 'Query personal order history',
          description: 'Returns the paginated list of orders belonging strictly to the authenticated shopper. Sorted newest first.',
          parameters: [
            { name: 'status', in: 'query', description: 'Filter by order status PENDING, PROCESSING, COMPLETED, CANCELLED', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page index', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items count limit per page', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Shopper order history retrieved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User orders retrieved successfully.' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' }
          }
        }
      },
      '/orders/my/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Query specific order detail',
          description: 'Retrieves specifications of a specific user order. Enforces identity checks to completely block Insecure Direct Object Reference (IDOR) attempts.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Order UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Order resolved successfully.' },
            401: { description: 'Unauthenticated.' },
            404: { description: 'Order not found or doesn\'t belong to user (IDOR prevention).' }
          }
        }
      },
      '/orders': {
        get: {
          tags: ['Orders'],
          summary: 'List all system orders (Admin Only)',
          description: 'Lists all system order transactions with support for status filtering and paginations. Gated strictly by ADMIN RBAC.',
          parameters: [
            { name: 'status', in: 'query', description: 'Filter by order status', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page index', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items count limit per page', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: { description: 'All orders retrieved successfully.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden. Insufficient permissions.' }
          }
        }
      },
      '/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Query detailed order (Admin Only)',
          description: 'Retrieves comprehensive order details, including associated customer profile and items lists. Gated strictly by ADMIN RBAC.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Order UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Order specifications resolved.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' },
            404: { description: 'Order not found.' }
          }
        }
      },
      '/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Modify order status parameter (Admin Only)',
          description: 'Updates specified order status parameter. Audits status transitions securely inside the database. Gated strictly by ADMIN RBAC.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Order UUID ID', schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], example: 'PROCESSING' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Order status updated successfully.' },
            400: { description: 'Validation fails or incorrect status.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' },
            404: { description: 'Order not found.' }
          }
        }
      },
      '/audit/logs': {
        get: {
          tags: ['Audit'],
          summary: 'Query paginated operational security audit logs (Admin Only)',
          description: 'Retrieves security audit trail events list sorted newest first. Gated strictly by ADMIN role.',
          parameters: [
            { name: 'action', in: 'query', description: 'Filter by audit action (e.g. USER_LOGIN_SUCCESS, SWAGGER_SETTING_UPDATED)', schema: { type: 'string' } },
            { name: 'status', in: 'query', description: 'Filter by execution status SUCCESS or FAILED', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page index', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items count limit per page', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Audit logs retrieved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Audit logs retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          logs: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: 'f3b07384-d113-4ec2-a5d6-848834924c57' },
                                action: { type: 'string', example: 'SWAGGER_SETTING_UPDATED' },
                                status: { type: 'string', example: 'SUCCESS' },
                                ipAddress: { type: 'string', example: '127.0.0.1' },
                                userAgent: { type: 'string', example: 'Mozilla/5.0...' },
                                details: { type: 'string', example: 'Swagger runtime setting modified to enabled: true.' },
                                createdAt: { type: 'string', example: '2026-05-30T05:00:00Z' }
                              }
                            }
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              total: { type: 'integer', example: 1 },
                              page: { type: 'integer', example: 1 },
                              limit: { type: 'integer', example: 10 },
                              totalPages: { type: 'integer', example: 1 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden. Insufficient permissions.' }
          }
        }
      },
      '/audit/summary': {
        get: {
          tags: ['Audit'],
          summary: 'Query cumulative audit log counts metrics (Admin Only)',
          description: 'Calculates specific count aggregates (total, successes, failures, etc.) across security audit trails for administration dashboard analysis. Gated strictly by ADMIN role.',
          responses: {
            200: {
              description: 'Audit statistics summary retrieved.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Audit logs summary retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          totalLogs: { type: 'integer', example: 120 },
                          loginSuccessCount: { type: 'integer', example: 45 },
                          loginFailedCount: { type: 'integer', example: 10 },
                          unauthorizedAccessCount: { type: 'integer', example: 2 },
                          orderCreatedCount: { type: 'integer', example: 15 }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' }
          }
        }
      },
      '/settings': {
        get: {
          tags: ['Settings'],
          summary: 'Fetch global system configurations (Admin Only)',
          description: 'Queries dynamic settings parameters including NODE_ENV and current Swagger availability toggles. Gated strictly by ADMIN role.',
          responses: {
            200: {
              description: 'System configurations retrieved successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Development settings retrieved successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          swaggerEnabled: { type: 'boolean', example: true },
                          nodeEnv: { type: 'string', example: 'development' },
                          swaggerAvailable: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden.' }
          }
        }
      },
      '/settings/swagger': {
        patch: {
          tags: ['Settings'],
          summary: 'Toggle development Swagger documentation status (Admin Only)',
          description: 'Enables or disables interactive Swagger docs runtime visibility. Strictly blocked in production scopes, returning a 403 Forbidden. Gated strictly by ADMIN role.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['swaggerEnabled'],
                  properties: {
                    swaggerEnabled: { type: 'boolean', description: 'Enable or disable interactive OpenAPI docs runtime visibility', example: false }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Configurations settings toggled successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Swagger settings updated successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          swaggerEnabled: { type: 'boolean', example: false },
                          nodeEnv: { type: 'string', example: 'development' },
                          swaggerAvailable: { type: 'boolean', example: false }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Validation mismatch or invalid parameter types.' },
            401: { description: 'Unauthenticated.' },
            403: { description: 'Forbidden. E.g. when trying to modify settings in production.' }
          }
        }
      }
    }
  },
  apis: [], // Self-contained path declarations to ensure loading stability
};

/**
 * Conditionally mounts Swagger interactive documentation route.
 * Strictly active under development environments when enabled.
 * 
 * @param {object} app Express application instance
 */
const setupSwagger = (app) => {
  if (env.NODE_ENV === 'development') {
    const prisma = require('./prisma');
    const swaggerSpec = swaggerJsdoc(options);
    
    app.use('/api/docs', async (req, res, next) => {
      try {
        const setting = await prisma.appSetting.findUnique({
          where: { key: 'SWAGGER_ENABLED' }
        });
        const enabled = setting ? setting.value === 'true' : env.SWAGGER_ENABLED;
        if (!enabled) {
          return res.status(403).json({
            success: false,
            message: 'Swagger documentation is disabled by the administrator.'
          });
        }
        next();
      } catch (err) {
        // Fallback to env config if Prisma fails (prevents server crashes)
        if (!env.SWAGGER_ENABLED) {
          return res.status(403).json({
            success: false,
            message: 'Swagger documentation is disabled.'
          });
        }
        next();
      }
    }, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('[Swagger Docs] Dynamic middleware mounted at http://localhost:5001/api/docs');
  }
};

module.exports = setupSwagger;
