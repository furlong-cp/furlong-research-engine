#include <gtest/gtest.h>
#include "furlong/matching_engine.hpp"

using namespace furlong;

static Order limit(OrderId id, Side s, Price p, Quantity q) { return {id, s, OrderType::Limit, p, q}; }
static Order market(OrderId id, Side s, Quantity q) { return {id, s, OrderType::Market, 0, q}; }

TEST(MatchingEngine, NonCrossingOrderRests) {
    MatchingEngine e;
    EXPECT_TRUE(e.submit(limit(1, Side::Sell, 10001, 10)).empty());
    EXPECT_TRUE(e.submit(limit(2, Side::Buy, 10000, 10)).empty());
    EXPECT_EQ(e.book().best_bid(), 10000);
    EXPECT_EQ(e.book().best_ask(), 10001);
}

TEST(MatchingEngine, TradesAtMakerPrice) {
    MatchingEngine e;
    e.submit(limit(1, Side::Sell, 10001, 10));
    auto t = e.submit(limit(2, Side::Buy, 10005, 10));
    ASSERT_EQ(t.size(), 1u);
    EXPECT_EQ(t[0].price, 10001);
    EXPECT_EQ(t[0].quantity, 10u);
    EXPECT_EQ(t[0].maker_id, 1u);
    EXPECT_EQ(t[0].taker_id, 2u);
    EXPECT_EQ(e.book().order_count(), 0u);
}

TEST(MatchingEngine, PartialFillRestsRemainder) {
    MatchingEngine e;
    e.submit(limit(1, Side::Sell, 10001, 4));
    auto t = e.submit(limit(2, Side::Buy, 10001, 10));
    ASSERT_EQ(t.size(), 1u);
    EXPECT_EQ(t[0].quantity, 4u);
    EXPECT_EQ(e.book().best_bid(), 10001);
    EXPECT_EQ(e.book().quantity_at(Side::Buy, 10001), 6u);
}

TEST(MatchingEngine, PriceThenTimePriority) {
    MatchingEngine e;
    e.submit(limit(1, Side::Sell, 10002, 5));
    e.submit(limit(2, Side::Sell, 10001, 5));
    e.submit(limit(3, Side::Sell, 10001, 5));
    auto t = e.submit(market(4, Side::Buy, 12));
    ASSERT_EQ(t.size(), 3u);
    EXPECT_EQ(t[0].maker_id, 2u);  // best price, earliest
    EXPECT_EQ(t[1].maker_id, 3u);  // best price, later
    EXPECT_EQ(t[2].maker_id, 1u);  // worse price last
    EXPECT_EQ(t[2].quantity, 2u);
}

TEST(MatchingEngine, MarketRemainderIsDiscarded) {
    MatchingEngine e;
    e.submit(limit(1, Side::Sell, 10001, 5));
    auto t = e.submit(market(2, Side::Buy, 20));
    ASSERT_EQ(t.size(), 1u);
    EXPECT_EQ(e.book().order_count(), 0u);
}

TEST(MatchingEngine, SameInputsGiveSameTrades) {
    auto run = [] {
        MatchingEngine e;
        std::vector<Trade> all;
        for (auto o : {limit(1, Side::Sell, 101, 5), limit(2, Side::Sell, 102, 5),
                       limit(3, Side::Buy, 102, 7), market(4, Side::Sell, 3)}) {
            auto t = e.submit(o);
            all.insert(all.end(), t.begin(), t.end());
        }
        return all;
    };
    auto a = run(), b = run();
    ASSERT_EQ(a.size(), b.size());
    for (size_t i = 0; i < a.size(); ++i) {
        EXPECT_EQ(a[i].maker_id, b[i].maker_id);
        EXPECT_EQ(a[i].price, b[i].price);
        EXPECT_EQ(a[i].quantity, b[i].quantity);
    }
}