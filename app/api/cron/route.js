import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scrapeProductData } from '@/lib/scraper';
import { sendPriceAlert } from '@/lib/mailer';

export async function GET(req) {
  // Simple token authentication check if CRON_SECRET is configured
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secretParam !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // Fetch all products with their associated owners
    const products = await prisma.product.findMany({
      include: {
        user: true
      }
    });

    const results = [];
    let alertsTriggered = 0;

    for (const product of products) {
      console.log(`Cron: Scraping ${product.title} (${product.url})`);
      const scraped = await scrapeProductData(product.url);

      if (!scraped) {
        results.push({ id: product.id, title: product.title, status: 'failed_scraping' });
        continue;
      }

      // 1. Update current price in DB and add historical price log
      const updatedProduct = await prisma.product.update({
        where: { id: product.id },
        data: {
          currentPrice: scraped.price,
          priceHistory: {
            create: {
              price: scraped.price
            }
          }
        }
      });

      // 2. Evaluate threshold
      let alertSent = false;
      if (scraped.price > 0 && scraped.price <= product.targetPrice) {
        console.log(`Cron: Target hit for ${product.title}: $${scraped.price} <= $${product.targetPrice}`);
        alertSent = await sendPriceAlert(
          product.user.email,
          product.title,
          scraped.price,
          product.targetPrice,
          product.url
        );
        if (alertSent) alertsTriggered++;
      }

      results.push({
        id: product.id,
        title: product.title,
        previousPrice: product.currentPrice,
        newPrice: scraped.price,
        alertSent
      });
    }

    return NextResponse.json({
      message: 'Cron job completed successfully',
      processed: products.length,
      alertsTriggered,
      results
    });
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req) {
  // Support POST requests to the cron handler as well
  return GET(req);
}
