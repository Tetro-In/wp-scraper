import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
      prisma.productHistory.deleteMany(),
      prisma.scanLog.deleteMany(),
      prisma.product.deleteMany(),
      prisma.seller.deleteMany(),
      prisma.scraperRun.deleteMany(),
    ])

    return NextResponse.json({
      success: true,
      message: 'All data has been flushed successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to flush database' },
      { status: 500 }
    )
  }
}
