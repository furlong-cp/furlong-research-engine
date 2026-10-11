#pragma once
#include <vector>
#include "furlong/market_event.hpp"
#include "furlong/matching_engine.hpp"

namespace furlong {

struct ReplayResult {
    std::vector<Trade> trades;
    std::size_t events_processed = 0;
    std::size_t cancels_rejected = 0;
};

// Feeds events into a fresh engine, in order. Same events in, same result out.
ReplayResult replay(const std::vector<MarketEvent>& events);

}  // namespace furlong