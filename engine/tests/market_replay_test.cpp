#include <gtest/gtest.h>
#include "furlong/market_replay.hpp"

using namespace furlong;

static MarketEvent add(OrderId id, Side s, Price p, Quantity q) {
    return {EventType::NewOrder, {id, s, OrderType::Limit, p, q}, 0};
}
static MarketEvent mkt(OrderId id, Side s, Quantity q) {
    return {EventType::NewOrder, {id, s, OrderType::Market, 0, q}, 0};
}
static MarketEvent cancel(OrderId id) {
    return {EventType::Cancel, {}, id};
}

static std::vector<MarketEvent> sample_events() {
    return {
        add(1, Side::Sell, 10001, 10),
        add(2, Side::Sell, 10002, 10),
        add(3, Side::Buy, 9999, 10),
        cancel(3),
        add(4, Side::Buy, 10002, 15),
        mkt(5, Side::Sell, 5),
        cancel(999),
    };
}

TEST(MarketReplay, SameEventsGiveSameResult) {
    auto a = replay(sample_events());
    auto b = replay(sample_events());
    ASSERT_EQ(a.trades.size(), b.trades.size());
    for (size_t i = 0; i < a.trades.size(); ++i) {
        EXPECT_EQ(a.trades[i].taker_id, b.trades[i].taker_id);
        EXPECT_EQ(a.trades[i].maker_id, b.trades[i].maker_id);
        EXPECT_EQ(a.trades[i].price, b.trades[i].price);
        EXPECT_EQ(a.trades[i].quantity, b.trades[i].quantity);
    }
    EXPECT_EQ(a.events_processed, b.events_processed);
    EXPECT_EQ(a.cancels_rejected, b.cancels_rejected);
}

TEST(MarketReplay, CountsEventsAndRejectedCancels) {
    auto r = replay(sample_events());
    EXPECT_EQ(r.events_processed, 7u);
    EXPECT_EQ(r.cancels_rejected, 1u);
}

TEST(MarketReplay, ProducesExpectedTrades) {
    auto r = replay(sample_events());
    ASSERT_EQ(r.trades.size(), 2u);
    EXPECT_EQ(r.trades[0].maker_id, 1u);
    EXPECT_EQ(r.trades[0].price, 10001);
    EXPECT_EQ(r.trades[0].quantity, 10u);
    EXPECT_EQ(r.trades[1].maker_id, 2u);
    EXPECT_EQ(r.trades[1].price, 10002);
    EXPECT_EQ(r.trades[1].quantity, 5u);
}

TEST(MarketReplay, EmptyEventListIsFine) {
    auto r = replay({});
    EXPECT_TRUE(r.trades.empty());
    EXPECT_EQ(r.events_processed, 0u);
}
