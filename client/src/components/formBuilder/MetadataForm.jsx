import React from "react";
import { Calendar } from "../../components/ui/calendar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, TrashIcon } from "lucide-react";

const MetadataEditor = ({ metadata, onChange }) => {
  const handleChange = (field, value) =>
    onChange({ ...metadata, [field]: value });
  const handleNestedChange = (parent, key, value) =>
    onChange({ ...metadata, [parent]: { ...metadata[parent], [key]: value } });

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = metadata.prizes.map((prize, i) =>
      i === index ? { ...prize, [field]: value } : prize
    );
    onChange({ ...metadata, prizes: newPrizes });
  };
  const addPrize = () => {
    onChange({
      ...metadata,
      prizes: [
        ...metadata.prizes,
        {
          amount: 0,
          description: { fr: "", ar: "" },
          id: Date.now().toString(), // Add temporary ID
        },
      ],
    });
  };
  const removePrize = (i) =>
    onChange({
      ...metadata,
      prizes: metadata.prizes.filter((_, idx) => idx !== i),
    });

  const handleEventDateChange = (i, date) => {
    const dates = [...metadata.eventDates];
    dates[i] = date.toISOString();
    onChange({ ...metadata, eventDates: dates });
  };
  const addEventDate = () =>
    onChange({
      ...metadata,
      eventDates: [...metadata.eventDates, new Date().toISOString()],
    });
  const removeEventDate = (i) =>
    onChange({
      ...metadata,
      eventDates: metadata.eventDates.filter((_, idx) => idx !== i),
    });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Form Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title (FR)</Label>
            <Input
              value={metadata.title.fr}
              onChange={(e) =>
                handleNestedChange("title", "fr", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Title (AR)</Label>
            <Input
              dir="rtl"
              value={metadata.title.ar}
              onChange={(e) =>
                handleNestedChange("title", "ar", e.target.value)
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Description (FR)</Label>
            <Textarea
              value={metadata.description.fr}
              onChange={(e) =>
                handleNestedChange("description", "fr", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Description (AR)</Label>
            <Textarea
              dir="rtl"
              value={metadata.description.ar}
              onChange={(e) =>
                handleNestedChange("description", "ar", e.target.value)
              }
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <Label>Affiche / Image URL</Label>
          <Input
            value={metadata.imageUrl}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
          />
        </div>

        {/* Application Period */}
        <div className="space-y-4">
          <h3 className="font-medium">Application Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["startDate", "endDate"].map((field, idx) => (
              <div key={field}>
                <Label>{idx === 0 ? "Start Date" : "End Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {metadata[field]
                        ? format(new Date(metadata[field]), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        metadata[field] ? new Date(metadata[field]) : new Date()
                      }
                      onSelect={(date) =>
                        handleChange(field, date.toISOString())
                      }
                      fromDate={
                        field === "endDate" && metadata.startDate
                          ? new Date(metadata.startDate)
                          : undefined
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Date */}
        <div>
          <Label>Announcement Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {metadata.announcementDate
                  ? format(new Date(metadata.announcementDate), "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  metadata.announcementDate
                    ? new Date(metadata.announcementDate)
                    : new Date()
                }
                onSelect={(date) =>
                  handleChange("announcementDate", date.toISOString())
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Event Dates */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Event Dates</h3>
            <Button size="sm" onClick={addEventDate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Date
            </Button>
          </div>
          {metadata.eventDates.map((iso, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEventDate(i)}
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Label>Date #{i + 1}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(iso), "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(iso)}
                    onSelect={(date) => handleEventDateChange(i, date)}
                  />
                </PopoverContent>
              </Popover>
            </Card>
          ))}
        </div>

        {/* Event Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Event Location (FR)</Label>
            <Input
              value={metadata.eventLocation.fr}
              onChange={(e) =>
                handleNestedChange("eventLocation", "fr", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Event Location (AR)</Label>
            <Input
              dir="rtl"
              value={metadata.eventLocation.ar}
              onChange={(e) =>
                handleNestedChange("eventLocation", "ar", e.target.value)
              }
            />
          </div>
        </div>

        {/* Prizes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Prizes</h3>
            <Button size="sm" onClick={addPrize}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Prize
            </Button>
          </div>
          {metadata.prizes.map((p, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePrize(i)}
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Amount (DT)</Label>
                  <Input
                    type="number"
                    value={p.amount}
                    onChange={(e) =>
                      handlePrizeChange(i, "amount", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Description (FR)</Label>
                  <Input
                    value={p.description.fr}
                    onChange={(e) =>
                      handlePrizeChange(i, "description", {
                        ...p.description,
                        fr: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description (AR)</Label>
                  <Input
                    dir="rtl"
                    value={p.description.ar}
                    onChange={(e) =>
                      handlePrizeChange(i, "description", {
                        ...p.description,
                        ar: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataEditor;
