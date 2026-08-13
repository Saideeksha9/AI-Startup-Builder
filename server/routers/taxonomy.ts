import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listInterestFields, listInterestTopics } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const taxonomyRouter = router({
  fields: publicProcedure.query(async () => {
    try {
      return await listInterestFields();
    } catch (error) {
      console.error("Loading interest fields failed", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Interest fields could not be loaded." });
    }
  }),
  topics: publicProcedure.input(z.object({ fieldId: z.number().int().positive() })).query(async ({ input }) => {
    try {
      return await listInterestTopics(input.fieldId);
    } catch (error) {
      console.error("Loading interest topics failed", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Interest topics could not be loaded." });
    }
  }),
});
