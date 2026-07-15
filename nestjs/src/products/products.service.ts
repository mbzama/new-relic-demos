import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const newrelic = require('newrelic') as typeof import('newrelic');
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: '1', name: 'Widget Pro', price: 29.99, category: 'widgets', stock: 100, createdAt: new Date() },
    { id: '2', name: 'Gadget Deluxe', price: 99.99, category: 'gadgets', stock: 50, createdAt: new Date() },
    { id: '3', name: 'Super Gizmo', price: 149.99, category: 'gadgets', stock: 25, createdAt: new Date() },
  ];

  findAll(category?: string): Product[] {
    // Demonstrate custom attributes on a transaction
    newrelic.addCustomAttributes({
      'products.filter.category': category || 'all',
      'products.total_count': this.products.length,
    });

    const result = category
      ? this.products.filter((p) => p.category === category)
      : this.products;

    // Record a custom metric for product lookups
    newrelic.recordMetric('Custom/Products/Lookup', result.length);

    return result;
  }

  findOne(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      // New Relic will automatically capture the 404 exception
      throw new NotFoundException(`Product ${id} not found`);
    }
    newrelic.addCustomAttribute('product.id', id);
    newrelic.addCustomAttribute('product.category', product.category);
    return product;
  }

  create(dto: CreateProductDto): Product {
    const product: Product = {
      id: randomUUID(),
      ...dto,
      createdAt: new Date(),
    };
    this.products.push(product);

    // Record a custom event visible in New Relic Query Builder
    newrelic.recordCustomEvent('ProductCreated', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });

    newrelic.recordMetric('Custom/Products/Created', 1);
    return product;
  }

  update(id: string, dto: Partial<CreateProductDto>): Product {
    const product = this.findOne(id);
    Object.assign(product, dto);

    newrelic.recordCustomEvent('ProductUpdated', {
      productId: id,
      updatedFields: Object.keys(dto).join(','),
    });

    return product;
  }

  remove(id: string): void {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    this.products.splice(index, 1);
    newrelic.recordCustomEvent('ProductDeleted', { productId: id });
  }
}
