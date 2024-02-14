import { afterAll, afterEach, beforeAll, beforeEach, describe, expect} from "@jest/globals";
import { init, TestPlatform } from "../setup";
import TestHelpers from "../common/common_test_helpers";

describe("The /users/quota API", () => {
  let platform: TestPlatform;
  let currentUser: TestHelpers;

  beforeEach(async () => {
    platform = await init();
    currentUser = await TestHelpers.getInstance(platform);
  });

  afterEach(async () => {
    await platform.tearDown();
    platform = null;
  });

  beforeAll(async () => {
    const platform = await init({
      services: [
        "database",
        "search",
        "message-queue",
        "websocket",
        "applications",
        "webserver",
        "user",
        "auth",
        "storage",
        "counter",
        "console",
        "workspaces",
        "statistics",
        "platform-services",
      ],
    });
  });

  afterAll(async () => {
  });


  test("should 200 with available quota", async () => {
    //given
    const userQuota = 200000000;
    const doc = await currentUser.createDocumentFromFilename("sample.png", "user_" + currentUser.user.id)

    //when
    const quota = await currentUser.quota();

    expect(quota.total).toBe(userQuota);
    expect(quota.remaining).toBe(userQuota - doc.size); //198346196 //198342406
    expect(quota.used).toBe(doc.size);
  });

});
