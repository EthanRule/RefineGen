import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
