import React, { Fragment } from "react";
import { Container } from "@/components/container";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";

const Ideas = () => {
  return (
    <Container>
      <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-5 lg:gap-7.5">
        <div className="card border-0">
          <div className="flex items-center px-4 pt-3">
            <div className="mr-3 text-gray-900">BTC/USD</div>
            <div className="text-success text-2sm">Partial Win</div>
          </div>
          <div className="flex items-center px-4 pb-3">
            <div className="text-2sm text-gray-900">Buy</div>
            <div className="text-2sm px-2 text-gray-900">•</div>
            <div className="text-2sm text-gray-900">4h</div>
            <div className="text-2sm px-2 text-gray-900">•</div>
            <div className="text-2sm text-gray-900">Swing</div>
          </div>
          <img
            src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
            className="w-full h-auto"
            alt=""
          />
          <div className="card-border card-rounded-b flex flex-col gap-2 px-5 py-4.5">
            <div className="flex gap-10">
              <div>
                <div className="text-2sm text-gray-800 uppercase">Entry</div>
                <div className="text-sm text-gray-900">78200 - 78500</div>
              </div>
              <div>
                <div className="text-2sm text-gray-800 uppercase">Invalidation</div>
                <div className="text-sm text-gray-900">77400</div>
              </div>
            </div>
            <div>
              <div className="text-2sm text-gray-800 uppercase">Exits</div>
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">1</div>
                  <div className="text-sm text-gray-900">82000</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">2</div>
                  <div className="text-sm text-gray-900">89000</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">3</div>
                  <div className="text-sm text-gray-900">98000</div>
                </div>
              </div>
            </div>
            <div className="flex items-center  pt-4">
              <img
                src={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                className="rounded-full size-7 me-2"
                alt=""
              />
              <div>
                <Link
                  to="/public-profile/profiles/nft"
                  className="text-2sm text-gray-800 hover:text-primary mb-px"
                >
                  Cody Fisher
                </Link>
                <div className="text-2sm text-gray-700 mb-px">
                  Posted: Mar 11, 2025, 5:30 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Ideas;
