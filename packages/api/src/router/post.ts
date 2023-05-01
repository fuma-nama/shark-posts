import { z } from "zod";

import { prisma, type Post, type User } from "@acme/db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

type UserInfo = Pick<User, "id" | "name" | "image">;

type PostWithFavourite = Post & {
  author: UserInfo;
  favourites: number;
  isFavourite: boolean;
};

export const postRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z
          .object({
            type: z.enum(["after", "before"]),
            date: z.date(),
          })
          .nullish(),
      }),
    )
    .query(({ input, ctx }) => {
      return prisma.post
        .findMany({
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            favourites:
              ctx.session != null
                ? {
                    take: 1,
                    select: {
                      user_id: true,
                    },
                    where: {
                      user_id: ctx.session.user.id,
                    },
                  }
                : undefined,
            _count: {
              select: {
                favourites: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
          where: {
            timestamp:
              input.cursor == null
                ? undefined
                : input.cursor.type === "after"
                ? {
                    gt: new Date(input.cursor.date),
                  }
                : {
                    lt: new Date(input.cursor.date),
                  },
          },
          take: input.limit,
        })
        .then((result) =>
          result.map(
            ({ favourites, _count, ...row }) =>
              ({
                ...row,
                isFavourite: favourites != null && favourites.length !== 0,
                favourites: _count.favourites,
              } as PostWithFavourite),
          ),
        );
    }),
  getFavourites: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.date().nullish(),
      }),
    )
    .query(({ input, ctx }) => {
      return prisma.post
        .findMany({
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                favourites: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
          where: {
            favourites: {
              some: {
                user_id: ctx.session.user.id,
              },
            },
            timestamp:
              input.cursor == null
                ? undefined
                : {
                    lt: new Date(input.cursor),
                  },
          },
          take: input.limit,
        })
        .then((result) =>
          result.map(
            ({ _count, ...row }) =>
              ({
                ...row,
                isFavourite: true,
                favourites: _count.favourites,
              } as PostWithFavourite),
          ),
        );
    }),
  all: publicProcedure.query(() => {
    return prisma.post.findMany({
      include: { author: true },
      orderBy: { timestamp: "desc" },
    });
  }),
  hasNewPosts: publicProcedure
    .input(z.object({ after: z.date() }))
    .query(async ({ input }) => {
      const count = await prisma.post.count({
        where: {
          timestamp: {
            gt: input.after,
          },
        },
      });

      return {
        count,
      };
    }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.post.findFirst({ where: { id: input.id } });
    }),
  setToFavourite: protectedProcedure
    .input(z.object({ post_id: z.string(), favourite: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (input.favourite) {
        await prisma.favourite.createMany({
          data: {
            post_id: input.post_id,
            user_id: ctx.session.user.id,
          },
          skipDuplicates: true,
        });
      } else {
        await prisma.favourite.deleteMany({
          where: {
            post_id: input.post_id,
            user_id: ctx.session.user.id,
          },
        });
      }
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
