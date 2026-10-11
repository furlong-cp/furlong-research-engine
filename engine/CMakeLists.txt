cmake_minimum_required(VERSION 3.20)
project(furlong_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(furlong src/order_book.cpp src/matching_engine.cpp src/market_replay.cpp)
target_include_directories(furlong PUBLIC include)

include(FetchContent)
FetchContent_Declare(googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

enable_testing()
add_executable(furlong_tests tests/order_book_test.cpp tests/matching_engine_test.cpp tests/market_replay_test.cpp)
target_link_libraries(furlong_tests PRIVATE furlong GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(furlong_tests)