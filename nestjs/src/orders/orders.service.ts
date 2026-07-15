import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const newrelic = require('newrelic') as typeof import('newrelic');
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { randomUUID } from 'crypto';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  async findAll(customerId?: string): Promise<Order[]> {
    // Simulate DB read latency — shows up as a slow segment in New Relic traces
    await newrelic.startSegment('db:orders:findAll', true, async () => {
      await delay(50 + Math.random() * 100);
    });

    newrelic.addCustomAttribute('orders.customer_filter', customerId || 'all');

    return customerId
      ? this.orders.filter((o) => o.customerId === customerId)
      : this.orders;
  }

  async findOne(id: string): Promise<Order> {
    await newrelic.startSegment('db:orders:findOne', true, async () => {
      await delay(30 + Math.random() * 70);
    });

    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    newrelic.addCustomAttributes({
      'order.id': id,
      'order.status': order.status,
      'order.total': order.total,
      'order.item_count': order.items.length,
    });

    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order: Order = {
      id: randomUUID(),
      customerId: dto.customerId,
      items: dto.items,
      total,
      status: 'pending',
      createdAt: new Date(),
    };

    // Simulate payment processing as a traced segment
    await newrelic.startSegment('external:payment-gateway', true, async () => {
      await delay(200 + Math.random() * 300);
    });

    // Simulate inventory reservation
    await newrelic.startSegment('db:inventory:reserve', true, async () => {
      await delay(50 + Math.random() * 100);
    });

    order.status = 'processing';
    this.orders.push(order);

    newrelic.recordCustomEvent('OrderPlaced', {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      itemCount: order.items.length,
    });

    newrelic.recordMetric('Custom/Orders/Revenue', order.total);
    newrelic.recordMetric('Custom/Orders/Created', 1);

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.status;
    order.status = status;

    newrelic.recordCustomEvent('OrderStatusChanged', {
      orderId: id,
      previousStatus,
      newStatus: status,
    });

    return order;
  }
}
