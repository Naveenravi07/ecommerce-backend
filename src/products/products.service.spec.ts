import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { CreateProductDto } from './dto/product.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockSelectChain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnValue([]),
  };

  let mockDb = {
    select: jest.fn().mockReturnValue(mockSelectChain)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('createProduct', () => {

    it('Should throw not found exception if category does not exist', async () => {
      const createProductDto: CreateProductDto = {
        title: 'Test Product',
        description: 'Test Description',
        categoryId: 999,
        colors: [
            {
                name: 'Red',
                hexCode: '#FF0000',
                images: [{
                    url: 'http://example.com/red1.jpg',
                    isPrimary: true
                }],
                variants: [
                    {
                        size: 'S',
                        price: 1000,
                        offerPrice: 899,
                        stock: 10,
                        isPrimary: false
                    }
                ]
            }
        ],
        featured:false,
        shippingfee:50,
        productDetails: {}
      };

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
