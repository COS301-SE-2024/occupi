import React from "react";
import { User, Chip, Tooltip } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { OccupancyModal } from "@components/index";

type StatusColorMap = {
  [key: string]: "success" | "danger" | "warning";
};

const statusColorMap: StatusColorMap = {
  ONSITE: "success",
  OFFSITE: "danger",
  BOOKED: "warning",
};

export const renderCell = (user: any, columnKey: React.Key, onOpen: () => void) => {
  const cellValue = user[columnKey as keyof typeof user];

  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{ radius: "lg", src: user.avatar }}
          description={user.email}
          name={cellValue}
        >
          {user.email}
        </User>
      );
    case "role":
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small text-text_col capitalize">{cellValue}</p>
          <p className="text-bold text-tiny capitalize text-default-400">{user.team}</p>
        </div>
      );
    case "status":
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[user.status]}
          size="sm"
          variant="flat"
        >
          {cellValue}
        </Chip>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="View User Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <div onClick={onOpen}>
                {/* <EyeIcon /> */}
              </div>
              <OccupancyModal user={user}/>
            </span>
          </Tooltip>
          <Tooltip content="Email user">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <a
                href={`mailto:${user.email}`}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};