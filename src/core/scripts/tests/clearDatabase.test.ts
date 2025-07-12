import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the prisma client
const mockPrisma = {
  user: {
    deleteMany: vi.fn(),
  },
  userPreferences: {
    deleteMany: vi.fn(),
  },
  race: {
    deleteMany: vi.fn(),
  },
  payment: {
    deleteMany: vi.fn(),
  },
  subscription: {
    deleteMany: vi.fn(),
  },
  product: {
    deleteMany: vi.fn(),
  },
  message: {
    deleteMany: vi.fn(),
  },
  chat: {
    deleteMany: vi.fn(),
  },
  media: {
    deleteMany: vi.fn(),
  },
  location: {
    deleteMany: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock("../../infra/prisma/client.ts", () => ({
  default: mockPrisma,
}));

// Mock the race service
const mockRaceService = {
  getAllRaces: vi.fn(),
  deleteRace: vi.fn(),
};

vi.mock("../../infra/dependencies.ts", () => ({
  raceService: mockRaceService,
}));

// Mock process.exit
const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit called");
});

describe("clearCompleteDatabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear all tables in the correct order", async () => {
    // Mock all deleteMany operations to succeed
    mockPrisma.user.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.userPreferences.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.race.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.payment.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.subscription.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.product.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.message.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.chat.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.media.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.location.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.$disconnect.mockResolvedValue(undefined);

    // Mock race service
    mockRaceService.getAllRaces.mockResolvedValue([
      { id: "1", title: "Test Race" },
      { id: "2", title: "Another Race" },
    ]);
    mockRaceService.deleteRace.mockResolvedValue(undefined);

    // Import and run the script
    const { clearCompleteDatabase } = await import(
      "../clearCompleteDatabase.ts"
    );
    await clearCompleteDatabase();

    // Verify the operations were called in correct order
    expect(mockPrisma.message.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.chat.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.subscription.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.payment.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.product.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.userPreferences.deleteMany).toHaveBeenCalledWith({});
    expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({});
    expect(mockRaceService.getAllRaces).toHaveBeenCalled();
    expect(mockRaceService.deleteRace).toHaveBeenCalledWith("1");
    expect(mockRaceService.deleteRace).toHaveBeenCalledWith("2");
  });

  it("should handle database errors gracefully", async () => {
    // Mock one operation to fail
    mockPrisma.message.deleteMany.mockRejectedValue(
      new Error("Database error")
    );
    mockPrisma.$disconnect.mockResolvedValue(undefined);

    // Import and run the script
    const { clearCompleteDatabase } = await import(
      "../clearCompleteDatabase.ts"
    );

    // Should call process.exit on error
    await expect(clearCompleteDatabase()).rejects.toThrow(
      "process.exit called"
    );

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});

describe("clearDatabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear main tables", async () => {
    // Mock race service
    mockRaceService.getAllRaces.mockResolvedValue([
      { id: "1", title: "Test Race" },
      { id: "2", title: "Another Race" },
    ]);
    mockRaceService.deleteRace.mockResolvedValue(undefined);
    mockPrisma.$disconnect.mockResolvedValue(undefined);

    // Import and run the script
    const { clearDatabase } = await import("../clearDatabase.ts");
    await clearDatabase();

    // Verify the operations were called
    expect(mockRaceService.getAllRaces).toHaveBeenCalled();
    expect(mockRaceService.deleteRace).toHaveBeenCalledWith("1");
    expect(mockRaceService.deleteRace).toHaveBeenCalledWith("2");
  });

  it("should handle database errors gracefully", async () => {
    // Mock one operation to fail
    mockRaceService.getAllRaces.mockRejectedValue(new Error("Database error"));
    mockPrisma.$disconnect.mockResolvedValue(undefined);

    // Import and run the script
    const { clearDatabase } = await import("../clearDatabase.ts");

    // Should call process.exit on error
    await expect(clearDatabase()).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
