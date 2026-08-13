import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listInterestFields: vi.fn(),
  listInterestTopics: vi.fn(),
}));

import { listInterestFields, listInterestTopics } from "./db";
import { taxonomyRouter } from "./routers/taxonomy";

describe("taxonomy router", () => {
  const caller = taxonomyRouter.createCaller({} as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns database-backed interest fields", async () => {
    const fields = [{ id: 1, name: "Medical/Healthcare", slug: "medical-healthcare", createdAt: new Date() }];
    vi.mocked(listInterestFields).mockResolvedValue(fields as never);

    await expect(caller.fields()).resolves.toEqual(fields);
  });

  it("filters database-backed topics by the requested field", async () => {
    const topics = [{ id: 2, fieldId: 1, name: "Telemedicine", slug: "telemedicine", createdAt: new Date() }];
    vi.mocked(listInterestTopics).mockResolvedValue(topics as never);

    await expect(caller.topics({ fieldId: 1 })).resolves.toEqual(topics);
    expect(listInterestTopics).toHaveBeenCalledWith(1);
  });
});
