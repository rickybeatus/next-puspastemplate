async function main() {
    console.log("🌱 Starting database seeding...\n");

    try {
        // Phase 1: Independent tables (no FK dependencies)

        console.log("\n🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main();
