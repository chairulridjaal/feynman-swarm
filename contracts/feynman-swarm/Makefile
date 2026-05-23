default: build

all: test

test:
	cargo test -p feynman-swarm

build:
	stellar contract build --package feynman-swarm
	@ls -l ../../target/wasm32v1-none/release/*.wasm

fmt:
	cargo fmt --all

clean:
	cargo clean
