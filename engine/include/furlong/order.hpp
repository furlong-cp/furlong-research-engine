#pragma once
#include <cstdint>

namespace furlong {

using OrderId = std::uint64_t;
using Price = std::int64_t;      // integer ticks, never floating point
using Quantity = std::uint64_t;

enum class Side { Buy, Sell };
enum class OrderType { Limit, Market };

struct Order {
    OrderId id;
    Side side;
    OrderType type;
    Price price;       // ignored for market orders
    Quantity quantity;
};

struct Trade {
    OrderId taker_id;
    OrderId maker_id;
    Price price;       // always the resting (maker) order's price
    Quantity quantity;
};

}  // namespace furlong