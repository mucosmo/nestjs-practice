#!/bin/bash

RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color (重置颜色)

if [[ $npm_config_user_agent && ! $npm_config_user_agent =~ "pnpm" ]]; then
  echo -e "${RED}${BOLD}ERROR:${NC} ${RED}For consistency and better performance, please use pnpm to install dependencies.${NC}"
  exit 1
fi