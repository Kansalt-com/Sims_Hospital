import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { authenticate } from "../../middleware/auth.js";
import { validateQuery } from "../../middleware/validate.js";
import { CACHE_PREFIXES } from "../../services/cache.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getOrSetCache } from "../../utils/memoryCache.js";

const router = Router();

const querySchema = z.object({
  active: z.enum(["true", "false"]).optional(),
});

router.use(authenticate);

router.get(
  "/",
  validateQuery(querySchema),
  asyncHandler(async (req, res) => {
    const { active } = req.query as z.infer<typeof querySchema>;
    const payload = await getOrSetCache(`${CACHE_PREFIXES.rooms}list:${active ?? "all"}`, 5 * 60_000, async () => {
      const rows = await prisma.room.findMany({
        where: {
          active: active === undefined ? undefined : active === "true",
        },
        select: {
          id: true,
          ward: true,
          name: true,
          floor: true,
          description: true,
          active: true,
          updatedAt: true,
          beds: {
            where: {
              active: true,
            },
            select: {
              id: true,
              bedNumber: true,
              status: true,
              notes: true,
              active: true,
              updatedAt: true,
            },
            orderBy: { bedNumber: "asc" },
          },
        },
        orderBy: [{ ward: "asc" }, { name: "asc" }],
      });

      return { data: rows };
    });

    res.json(payload);
  }),
);

export const roomsRouter = router;
