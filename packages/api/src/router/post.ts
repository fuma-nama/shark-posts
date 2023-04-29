import { z } from "zod";

import { prisma } from "@acme/db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(() => {
    return prisma.post.findMany({
      include: { author: true },
      orderBy: { timestamp: "desc" },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.post.findFirst({ where: { id: input.id } });
    }),
  addToFavourite: protectedProcedure
    .input(z.object({ post_id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.favourite.createMany({
        data: {
          post_id: input.post_id,
          user_id: ctx.session.user.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.post.create({
        include: {
          author: true,
        },
        data: {
          ...input,
          author_id: ctx.session.user.id,
        },
      });
    }),
  delete: publicProcedure.input(z.string()).mutation(({ input }) => {
    return prisma.post.deleteMany({ where: { id: input } });
  }),
});
