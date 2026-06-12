import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { scrapeProductData } from '@/lib/scraper';

export async function GET(req) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { userId: userPayload.id },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { url, targetPrice } = await req.json();

    if (!url || !targetPrice || isNaN(parseFloat(targetPrice))) {
      return NextResponse.json(
        { error: 'Valid URL and target price are required.' },
        { status: 400 }
      );
    }

    const targetVal = parseFloat(targetPrice);

    // Scrape details
    const scraped = await scrapeProductData(url);
    if (!scraped) {
      return NextResponse.json(
        { error: 'Failed to parse metadata from the URL. Please verify the link.' },
        { status: 422 }
      );
    }

    // Save product & initial price history
    const product = await prisma.product.create({
      data: {
        url,
        title: scraped.title,
        imageUrl: scraped.imageUrl,
        targetPrice: targetVal,
        currentPrice: scraped.price,
        userId: userPayload.id,
        priceHistory: {
          create: {
            price: scraped.price
          }
        }
      },
      include: {
        priceHistory: true
      }
    });

    return NextResponse.json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
