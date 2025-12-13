import type { Route } from "./+types/components";
import { useState } from "react";
import { Button } from "../components/button";
import { Badge, BadgeButton } from "../components/badge";
import { Avatar, AvatarButton } from "../components/avatar";
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from "../components/alert";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "../components/dialog";
import { Input, InputGroup } from "../components/input";
import { Textarea } from "../components/textarea";
import { Checkbox, CheckboxField, CheckboxGroup } from "../components/checkbox";
import { Radio, RadioField, RadioGroup } from "../components/radio";
import { Switch, SwitchField, SwitchGroup } from "../components/switch";
import { Select } from "../components/select";
import { Heading, Subheading } from "../components/heading";
import { Text, TextLink, Strong, Code } from "../components/text";
import { Link } from "../components/link";
import { Divider } from "../components/divider";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "../components/table";
import { Pagination, PaginationPrevious, PaginationNext, PaginationList, PaginationPage, PaginationGap } from "../components/pagination";
import { DescriptionList, DescriptionTerm, DescriptionDetails } from "../components/description-list";
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from "../components/fieldset";
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownHeader, DropdownSection, DropdownHeading, DropdownDivider } from "../components/dropdown";
import { Listbox, ListboxOption, ListboxLabel, ListboxDescription } from "../components/listbox";
import { Combobox, ComboboxOption, ComboboxLabel, ComboboxDescription } from "../components/combobox";
import { Navbar, NavbarDivider, NavbarSection, NavbarSpacer, NavbarItem, NavbarLabel } from "../components/navbar";
import { Sidebar, SidebarHeader, SidebarBody, SidebarFooter, SidebarSection, SidebarDivider, SidebarSpacer, SidebarHeading, SidebarItem, SidebarLabel } from "../components/sidebar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Components - Component Library" },
    { name: "description", content: "View all available components" },
  ];
}

export default function Components() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("option1");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Heading level={1} className="mb-2">Component Library</Heading>
        <Text className="mb-8 text-zinc-600 dark:text-zinc-400">
          Browse all available components in the library
        </Text>

        <div className="space-y-12">
          {/* Buttons */}
          <section>
            <Subheading level={2} className="mb-4">Buttons</Subheading>
            <div className="flex flex-wrap gap-3">
              <Button>Default Button</Button>
              <Button color="blue">Blue Button</Button>
              <Button color="green">Green Button</Button>
              <Button outline>Outline Button</Button>
              <Button plain>Plain Button</Button>
              <Button href="/">Link Button</Button>
            </div>
          </section>

          {/* Badges */}
          <section>
            <Subheading level={2} className="mb-4">Badges</Subheading>
            <div className="flex flex-wrap gap-3">
              <Badge>Default Badge</Badge>
              <Badge color="blue">Blue Badge</Badge>
              <Badge color="green">Green Badge</Badge>
              <Badge color="red">Red Badge</Badge>
              <BadgeButton>Badge Button</BadgeButton>
            </div>
          </section>

          {/* Avatars */}
          <section>
            <Subheading level={2} className="mb-4">Avatars</Subheading>
            <div className="flex flex-wrap gap-3 items-center">
              <Avatar initials="JD" />
              <Avatar initials="AB" square />
              <AvatarButton initials="CB" />
            </div>
          </section>

          {/* Alerts */}
          <section>
            <Subheading level={2} className="mb-4">Alerts</Subheading>
            <div className="space-y-3">
              <Button onClick={() => setAlertOpen(true)}>Open Alert</Button>
              {alertOpen && (
                <Alert open={alertOpen} onClose={() => setAlertOpen(false)}>
                  <AlertTitle>Alert Title</AlertTitle>
                  <AlertDescription>This is an alert dialog component.</AlertDescription>
                  <AlertActions>
                    <Button onClick={() => setAlertOpen(false)}>Close</Button>
                  </AlertActions>
                </Alert>
              )}
            </div>
          </section>

          {/* Dialogs */}
          <section>
            <Subheading level={2} className="mb-4">Dialogs</Subheading>
            <div className="space-y-3">
              <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              {dialogOpen && (
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>This is a dialog component.</DialogDescription>
                  <DialogBody>
                    <Text>Dialog content goes here.</Text>
                  </DialogBody>
                  <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button color="blue" onClick={() => setDialogOpen(false)}>Confirm</Button>
                  </DialogActions>
                </Dialog>
              )}
            </div>
          </section>

          {/* Inputs */}
          <section>
            <Subheading level={2} className="mb-4">Inputs</Subheading>
            <div className="space-y-4 max-w-md">
              <InputGroup>
                <Input type="text" placeholder="Text input" />
              </InputGroup>
              <InputGroup>
                <Input type="email" placeholder="Email input" />
              </InputGroup>
              <InputGroup>
                <Input type="password" placeholder="Password input" />
              </InputGroup>
            </div>
          </section>

          {/* Textarea */}
          <section>
            <Subheading level={2} className="mb-4">Textarea</Subheading>
            <div className="max-w-md">
              <Textarea placeholder="Enter your message..." rows={4} />
            </div>
          </section>

          {/* Checkboxes */}
          <section>
            <Subheading level={2} className="mb-4">Checkboxes</Subheading>
            <div className="max-w-md">
              <CheckboxGroup>
                <CheckboxField>
                  <Checkbox checked={checkboxValue} onChange={(e) => setCheckboxValue(e.target.checked)} />
                  <Label>Checkbox option</Label>
                </CheckboxField>
                <CheckboxField>
                  <Checkbox defaultChecked />
                  <Label>Checked by default</Label>
                </CheckboxField>
              </CheckboxGroup>
            </div>
          </section>

          {/* Radio Buttons */}
          <section>
            <Subheading level={2} className="mb-4">Radio Buttons</Subheading>
            <div className="max-w-md">
              <RadioGroup value={selectedValue} onChange={setSelectedValue}>
                <RadioField>
                  <Radio value="option1" />
                  <Label>Option 1</Label>
                </RadioField>
                <RadioField>
                  <Radio value="option2" />
                  <Label>Option 2</Label>
                </RadioField>
              </RadioGroup>
            </div>
          </section>

          {/* Switches */}
          <section>
            <Subheading level={2} className="mb-4">Switches</Subheading>
            <div className="max-w-md">
              <SwitchGroup>
                <SwitchField>
                  <Switch checked={switchValue} onChange={setSwitchValue} />
                  <Label>Toggle switch</Label>
                </SwitchField>
                <SwitchField>
                  <Switch defaultChecked />
                  <Label>Checked by default</Label>
                </SwitchField>
              </SwitchGroup>
            </div>
          </section>

          {/* Select */}
          <section>
            <Subheading level={2} className="mb-4">Select</Subheading>
            <div className="max-w-md">
              <Select name="example">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
            </div>
          </section>

          {/* Typography */}
          <section>
            <Subheading level={2} className="mb-4">Typography</Subheading>
            <div className="space-y-3">
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Subheading level={2}>Subheading</Subheading>
              <Text>Regular text content</Text>
              <Text><Strong>Strong text</Strong></Text>
              <Text><Code>Code text</Code></Text>
              <TextLink href="/">Text Link</TextLink>
            </div>
          </section>

          {/* Links */}
          <section>
            <Subheading level={2} className="mb-4">Links</Subheading>
            <div className="flex flex-wrap gap-3">
              <Link href="/">Regular Link</Link>
              <Link href="/components">Components Link</Link>
            </div>
          </section>

          {/* Divider */}
          <section>
            <Subheading level={2} className="mb-4">Divider</Subheading>
            <Divider />
          </section>

          {/* Tables */}
          <section>
            <Subheading level={2} className="mb-4">Tables</Subheading>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Component 1</TableCell>
                  <TableCell>Button</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Component 2</TableCell>
                  <TableCell>Input</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Pagination */}
          <section>
            <Subheading level={2} className="mb-4">Pagination</Subheading>
            <Pagination>
              <PaginationPrevious />
              <PaginationList>
                <PaginationPage href="/?page=1">1</PaginationPage>
                <PaginationGap />
                <PaginationPage href="/?page=5">5</PaginationPage>
                <PaginationPage href="/?page=6">6</PaginationPage>
                <PaginationPage href="/?page=7">7</PaginationPage>
              </PaginationList>
              <PaginationNext />
            </Pagination>
          </section>

          {/* Description List */}
          <section>
            <Subheading level={2} className="mb-4">Description List</Subheading>
            <DescriptionList>
              <DescriptionTerm>Component Name</DescriptionTerm>
              <DescriptionDetails>Button Component</DescriptionDetails>
              <DescriptionTerm>Framework</DescriptionTerm>
              <DescriptionDetails>React Router</DescriptionDetails>
            </DescriptionList>
          </section>

          {/* Fieldset */}
          <section>
            <Subheading level={2} className="mb-4">Fieldset</Subheading>
            <div className="max-w-md">
              <Fieldset>
                <Legend>Form Group</Legend>
                <FieldGroup>
                  <Field>
                    <Label>Field Label</Label>
                    <Input type="text" />
                    <Description>This is a field description</Description>
                  </Field>
                </FieldGroup>
              </Fieldset>
            </div>
          </section>

          {/* Dropdown */}
          <section>
            <Subheading level={2} className="mb-4">Dropdown</Subheading>
            <Dropdown>
              <DropdownButton>Open Menu</DropdownButton>
              <DropdownMenu>
                <DropdownItem>Item 1</DropdownItem>
                <DropdownItem>Item 2</DropdownItem>
                <DropdownDivider />
                <DropdownItem>Item 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </section>

          {/* Listbox */}
          <section>
            <Subheading level={2} className="mb-4">Listbox</Subheading>
            <div className="max-w-md">
              <Listbox value={selectedValue} onChange={setSelectedValue} placeholder="Select an option">
                <ListboxOption value="option1">
                  <ListboxLabel>Option 1</ListboxLabel>
                </ListboxOption>
                <ListboxOption value="option2">
                  <ListboxLabel>Option 2</ListboxLabel>
                </ListboxOption>
                <ListboxOption value="option3">
                  <ListboxLabel>Option 3</ListboxLabel>
                </ListboxOption>
              </Listbox>
            </div>
          </section>

          {/* Combobox */}
          <section>
            <Subheading level={2} className="mb-4">Combobox</Subheading>
            <div className="max-w-md">
              <Combobox
                value={selectedValue}
                onChange={setSelectedValue}
                options={["option1", "option2", "option3"]}
                displayValue={(value) => value || ""}
                placeholder="Search..."
              >
                {(option) => (
                  <ComboboxOption value={option}>
                    <ComboboxLabel>{option}</ComboboxLabel>
                  </ComboboxOption>
                )}
              </Combobox>
            </div>
          </section>

          {/* Navbar */}
          <section>
            <Subheading level={2} className="mb-4">Navbar</Subheading>
            <Navbar>
              <NavbarSection>
                <NavbarItem href="/">Home</NavbarItem>
                <NavbarItem href="/components">Components</NavbarItem>
              </NavbarSection>
            </Navbar>
          </section>

          {/* Sidebar */}
          <section>
            <Subheading level={2} className="mb-4">Sidebar</Subheading>
            <div className="max-w-xs border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Sidebar>
                <SidebarHeader>
                  <SidebarHeading>Navigation</SidebarHeading>
                </SidebarHeader>
                <SidebarBody>
                  <SidebarSection>
                    <SidebarItem href="/">Home</SidebarItem>
                    <SidebarItem href="/components">Components</SidebarItem>
                  </SidebarSection>
                </SidebarBody>
              </Sidebar>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

