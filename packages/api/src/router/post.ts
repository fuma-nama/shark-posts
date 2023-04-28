import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      include: { author: true },
      orderBy: { id: "desc" },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findFirst({ where: { id: input.id } });
    }),
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          ...input,
          author_id: ctx.session.user.id,
        },
      });
    }),
  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.post.delete({ where: { id: input } });
  }),
});
