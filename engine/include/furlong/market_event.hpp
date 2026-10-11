#pragma once
#include "furlong/order.hpp"

namespace furlong {

enum class EventType { NewOrder, Cancel };

struct MarketEvent {
    EventType type;
    Order order;      // used when type is NewOrder
    OrderId cancel_id; // used when type is Cancel
};

}  // namespace furlong