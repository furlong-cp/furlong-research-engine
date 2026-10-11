#include <gtest/gtest.h>
#include "furlong/order_book.hpp"

using namespace furlong;

static Order limit(OrderId id, Side s, Price p, Quantity q) { return {id, s, OrderType::Limit, p, q}; }

TEST(OrderBook, TracksBestBidAndAsk) {
    OrderBook b;
    b.add(limit(1, Side::Buy, 9999, 10));
    b.add(limit(2, Side::Buy, 9998, 10));
    b.add(limit(3, Side::Sell, 10001, 10));
    b.add(limit(4, Side::Sell, 10002, 10));
    EXPECT_EQ(b.best_bid(), 9999);
    EXPECT_EQ(b.best_ask(), 10001);
}

TEST(OrderBook, RejectsInvalidOrders) {
    OrderBook b;
    EXPECT_FALSE(b.add(limit(1, Side::Buy, 100, 0)));
    EXPECT_TRUE(b.add(limit(2, Side::Buy, 100, 5)));
    EXPECT_FALSE(b.add(limit(2, Side::Buy, 100, 5)));  // duplicate id
}

TEST(OrderBook, CancelRemovesOrderAndEmptyLevel) {
    OrderBook b;
    b.add(limit(1, Side::Buy, 100, 5));
    EXPECT_TRUE(b.cancel(1));
    EXPECT_FALSE(b.best_bid().has_value());
    EXPECT_FALSE(b.cancel(1));
    EXPECT_EQ(b.order_count(), 0u);
}

TEST(OrderBook, TimePriorityWithinLevel) {
    OrderBook b;
    b.add(limit(1, Side::Sell, 100, 5));
    b.add(limit(2, Side::Sell, 100, 5));
    EXPECT_EQ(b.best_order(Side::Sell)->id, 1u);
    b.fill_front(Side::Sell, 3);
    EXPECT_EQ(b.best_order(Side::Sell)->id, 1u);
    EXPECT_EQ(b.best_order(Side::Sell)->quantity, 2u);
    b.fill_front(Side::Sell, 2);
    EXPECT_EQ(b.best_order(Side::Sell)->id, 2u);
}