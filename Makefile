.PHONY : build watch

watch:
	@echo "[Running watch]"
	docker run --rm -it -v ${PWD}:/app node:alpine sh -c "cd /app && npm ci && npm run dev"
