import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { toast, Toaster } from "react-hot-toast";
import {
    getRegistrationById,
    createSubmission,
    uploadRegistrationFile,
    type Registration,
    type FormField,
    type FormSection,
    type Package,
    type RegistrationAttachment,
} from "~/lib/firestore-registrations";
import { RadioGroup } from "@headlessui/react";

export function meta() {
    return [
        { title: "Registration Form | 360 Platform" },
        { name: "description", content: "Submit your registration" },
    ];
}

export default function PublicFormPage() {
    const { clubId, registrationId } = useParams<{ clubId: string; registrationId: string }>();
    const navigate = useNavigate();

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form data state - stores answers by field ID
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    // File refs for file upload fields
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Fetch registration on mount
    useEffect(() => {
        if (!clubId || !registrationId) {
            setError("Invalid form URL");
            setLoading(false);
            return;
        }

        async function fetchRegistration() {
            try {
                const reg = await getRegistrationById(clubId!, registrationId!);
                if (!reg) {
                    setError("Registration form not found");
                } else if (reg.status !== "open") {
                    setError("This registration form is currently closed");
                } else if (reg.isArchived) {
                    setError("This registration form is no longer available");
                } else if (reg.limitResponses && reg.registrationCount >= (reg.maxResponses || 0)) {
                    setError("This registration form has reached its maximum number of responses");
                } else {
                    setRegistration(reg);
                    // Set default package if only one exists
                    if (reg.packages.length === 1) {
                        setSelectedPackageId(reg.packages[0].id);
                    }
                }
            } catch (err) {
                console.error("Error fetching registration:", err);
                setError("Failed to load registration form");
            } finally {
                setLoading(false);
            }
        }

        fetchRegistration();
    }, [clubId, registrationId]);

    // Handle input change
    const handleFieldChange = (fieldId: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    // Handle multiple choice toggle
    const handleMultipleChoiceToggle = (fieldId: string, option: string) => {
        setFormData((prev) => {
            const currentValues = (prev[fieldId] as string[]) || [];
            if (currentValues.includes(option)) {
                return { ...prev, [fieldId]: currentValues.filter((v) => v !== option) };
            } else {
                return { ...prev, [fieldId]: [...currentValues, option] };
            }
        });
    };

    // Handle file upload
    const handleFileUpload = async (fieldId: string, file: File) => {
        if (!clubId || !registrationId) return;

        setUploadingFiles((prev) => ({ ...prev, [fieldId]: true }));

        try {
            const attachment = await uploadRegistrationFile(
                clubId,
                registrationId,
                file,
                "submission"
            );
            handleFieldChange(fieldId, attachment);
            toast.success(`File "${file.name}" uploaded successfully`);
        } catch (err) {
            console.error("Error uploading file:", err);
            toast.error("Failed to upload file");
        } finally {
            setUploadingFiles((prev) => ({ ...prev, [fieldId]: false }));
        }
    };

    // Validate form
    const validateForm = (): string | null => {
        if (!registration) return "Registration not loaded";

        for (const section of registration.sections) {
            for (const field of section.fields) {
                if (field.required) {
                    const value = formData[field.id];
                    if (value === undefined || value === null || value === "") {
                        return `"${field.label}" is required`;
                    }
                    if (field.type === "multiple_choice" && Array.isArray(value) && value.length === 0) {
                        return `"${field.label}" is required`;
                    }
                }

                // Email validation
                if (field.type === "email" && formData[field.id]) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData[field.id] as string)) {
                        return `"${field.label}" must be a valid email address`;
                    }
                }

                // Phone validation
                if (field.type === "phone" && formData[field.id]) {
                    const phoneRegex = /^[\d\s\-+()]+$/;
                    if (!phoneRegex.test(formData[field.id] as string)) {
                        return `"${field.label}" must be a valid phone number`;
                    }
                }
            }
        }

        // Check if package is required and selected
        if (registration.packages.length > 0 && !selectedPackageId) {
            return "Please select a package";
        }

        return null;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        if (!clubId || !registrationId || !registration) return;

        setSubmitting(true);

        try {
            // Get email from form data (look for email field)
            let userEmail = "";
            for (const section of registration.sections) {
                for (const field of section.fields) {
                    if (field.type === "email" && formData[field.id]) {
                        userEmail = formData[field.id] as string;
                        break;
                    }
                }
                if (userEmail) break;
            }

            await createSubmission(clubId, registrationId, {
                registrationId,
                clubId,
                userEmail,
                data: formData,
                packageId: selectedPackageId || undefined,
            });

            setSubmitted(true);
            toast.success("Registration submitted successfully!");
        } catch (err) {
            console.error("Error submitting registration:", err);
            toast.error("Failed to submit registration. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner className="mx-auto size-12 text-amber-500" />
                    <p className="mt-4 text-zinc-400">Loading form...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-8 text-center">
                    <div className="mx-auto size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <ErrorIcon className="size-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">Unable to Load Form</h1>
                    <p className="text-zinc-400">{error}</p>
                </div>
            </div>
        );
    }

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
                <Toaster position="top-right" />
                <div className="max-w-md w-full bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-8 text-center">
                    <div className="mx-auto size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                        <CheckCircleIcon className="size-8 text-emerald-500" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">Registration Submitted!</h1>
                    <p className="text-zinc-400 mb-6">
                        Thank you for your registration. You will receive a confirmation email shortly.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({});
                            setSelectedPackageId(registration?.packages.length === 1 ? registration.packages[0].id : null);
                        }}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Submit Another Response
                    </button>
                </div>
            </div>
        );
    }

    if (!registration) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {registration.logoUrl && (
                            <img
                                src={registration.logoUrl}
                                alt="Logo"
                                className="size-12 rounded-xl object-cover border border-zinc-700"
                            />
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-white">{registration.title}</h1>
                            {registration.categoryName && (
                                <p className="text-sm text-zinc-400">{registration.categoryName}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Description */}
                {registration.description && (
                    <div className="mb-8 p-6 bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl">
                        <p className="text-zinc-300 whitespace-pre-wrap">{registration.description}</p>
                    </div>
                )}

                {/* Attachments */}
                {registration.attachments && registration.attachments.length > 0 && (
                    <div className="mb-8 p-6 bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3">Attachments</h3>
                        <div className="flex flex-wrap gap-2">
                            {registration.attachments.map((attachment) => (
                                <a
                                    key={attachment.id}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
                                >
                                    <AttachmentIcon className="size-4" />
                                    {attachment.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sections */}
                    {registration.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                            <FormSectionComponent
                                key={section.id}
                                section={section}
                                formData={formData}
                                onFieldChange={handleFieldChange}
                                onMultipleChoiceToggle={handleMultipleChoiceToggle}
                                onFileUpload={handleFileUpload}
                                uploadingFiles={uploadingFiles}
                                fileInputRefs={fileInputRefs}
                            />
                        ))}

                    {/* Package Selection */}
                    {registration.packages.length > 0 && (
                        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Select Package</h2>
                            <RadioGroup
                                value={selectedPackageId}
                                onChange={setSelectedPackageId}
                                className="space-y-3"
                            >
                                {registration.packages.map((pkg) => (
                                    <RadioGroup.Option
                                        key={pkg.id}
                                        value={pkg.id}
                                        className={({ checked }) =>
                                            clsx(
                                                "relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all",
                                                checked
                                                    ? "border-amber-500 bg-amber-500/10"
                                                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                                            )
                                        }
                                    >
                                        {({ checked }) => (
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={clsx(
                                                            "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                            checked
                                                                ? "border-amber-500 bg-amber-500"
                                                                : "border-zinc-600"
                                                        )}
                                                    >
                                                        {checked && (
                                                            <div className="size-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <RadioGroup.Label
                                                            as="p"
                                                            className="font-medium text-white"
                                                        >
                                                            {pkg.title}
                                                        </RadioGroup.Label>
                                                        {pkg.description && (
                                                            <RadioGroup.Description
                                                                as="span"
                                                                className="text-sm text-zinc-400"
                                                            >
                                                                {pkg.description}
                                                            </RadioGroup.Description>
                                                        )}
                                                    </div>
                                                </div>
                                                {pkg.products.length > 0 && (
                                                    <div className="text-right">
                                                        <p className="font-semibold text-amber-400">
                                                            {pkg.products[0].currency}{" "}
                                                            {pkg.products
                                                                .reduce((sum, p) => sum + p.price, 0)
                                                                .toFixed(2)}
                                                        </p>
                                                        {pkg.products[0].paymentType === "recurring" && (
                                                            <p className="text-xs text-zinc-500">
                                                                /{pkg.products[0].recurringInterval}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </RadioGroup.Option>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={clsx(
                                "px-8 py-3 rounded-xl font-semibold text-white transition-all",
                                submitting
                                    ? "bg-zinc-700 cursor-not-allowed"
                                    : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                            )}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <LoadingSpinner className="size-5" />
                                    Submitting...
                                </span>
                            ) : (
                                "Submit Registration"
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-sm text-zinc-500">
                        Powered by <span className="text-amber-500 font-medium">360 Platform</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Form Section Component
function FormSectionComponent({
    section,
    formData,
    onFieldChange,
    onMultipleChoiceToggle,
    onFileUpload,
    uploadingFiles,
    fileInputRefs,
}: {
    section: FormSection;
    formData: Record<string, unknown>;
    onFieldChange: (fieldId: string, value: unknown) => void;
    onMultipleChoiceToggle: (fieldId: string, option: string) => void;
    onFileUpload: (fieldId: string, file: File) => void;
    uploadingFiles: Record<string, boolean>;
    fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}) {
    return (
        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            {(section.title || section.description) && (
                <div className="mb-6">
                    {section.title && (
                        <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                    )}
                    {section.description && (
                        <p className="mt-1 text-sm text-zinc-400">{section.description}</p>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {section.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                        <FormFieldComponent
                            key={field.id}
                            field={field}
                            value={formData[field.id]}
                            onChange={(value) => onFieldChange(field.id, value)}
                            onMultipleChoiceToggle={(option) => onMultipleChoiceToggle(field.id, option)}
                            onFileUpload={(file) => onFileUpload(field.id, file)}
                            isUploading={uploadingFiles[field.id] || false}
                            fileInputRef={(el) => {
                                fileInputRefs.current[field.id] = el;
                            }}
                        />
                    ))}
            </div>
        </div>
    );
}

// Form Field Component
function FormFieldComponent({
    field,
    value,
    onChange,
    onMultipleChoiceToggle,
    onFileUpload,
    isUploading,
    fileInputRef,
}: {
    field: FormField;
    value: unknown;
    onChange: (value: unknown) => void;
    onMultipleChoiceToggle: (option: string) => void;
    onFileUpload: (file: File) => void;
    isUploading: boolean;
    fileInputRef: (el: HTMLInputElement | null) => void;
}) {
    const inputClasses =
        "w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all";

    return (
        <div>
            <label className="block mb-2">
                <span className="text-sm font-medium text-zinc-200">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                </span>
                {field.description && (
                    <span className="block text-xs text-zinc-500 mt-0.5">{field.description}</span>
                )}
            </label>

            {/* Short Answer */}
            {field.type === "short_answer" && (
                <input
                    type="text"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer"
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Long Answer */}
            {field.type === "long_answer" && (
                <textarea
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer"
                    rows={4}
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Email */}
            {field.type === "email" && (
                <input
                    type="email"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="email@example.com"
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Phone */}
            {field.type === "phone" && (
                <input
                    type="tel"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Date */}
            {field.type === "date" && (
                <input
                    type="date"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Number */}
            {field.type === "number" && (
                <input
                    type="number"
                    value={(value as number) ?? ""}
                    onChange={(e) => onChange(e.target.valueAsNumber || "")}
                    placeholder="0"
                    min={field.validation?.min}
                    max={field.validation?.max}
                    className={inputClasses}
                    required={field.required}
                />
            )}

            {/* Single Choice */}
            {field.type === "single_choice" && field.options && (
                <div className="space-y-2">
                    {field.options.map((option) => (
                        <label
                            key={option}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                value === option
                                    ? "border-amber-500 bg-amber-500/10"
                                    : "border-zinc-700 bg-zinc-900/30 hover:border-zinc-600"
                            )}
                        >
                            <input
                                type="radio"
                                name={field.id}
                                value={option}
                                checked={value === option}
                                onChange={() => onChange(option)}
                                className="sr-only"
                            />
                            <div
                                className={clsx(
                                    "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                    value === option ? "border-amber-500 bg-amber-500" : "border-zinc-600"
                                )}
                            >
                                {value === option && <div className="size-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-zinc-200">{option}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Multiple Choice */}
            {field.type === "multiple_choice" && field.options && (
                <div className="space-y-2">
                    {field.options.map((option) => {
                        const isChecked = Array.isArray(value) && value.includes(option);
                        return (
                            <label
                                key={option}
                                className={clsx(
                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    isChecked
                                        ? "border-amber-500 bg-amber-500/10"
                                        : "border-zinc-700 bg-zinc-900/30 hover:border-zinc-600"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onMultipleChoiceToggle(option)}
                                    className="sr-only"
                                />
                                <div
                                    className={clsx(
                                        "size-5 rounded-md border-2 flex items-center justify-center transition-colors",
                                        isChecked ? "border-amber-500 bg-amber-500" : "border-zinc-600"
                                    )}
                                >
                                    {isChecked && <CheckIcon className="size-3 text-white" />}
                                </div>
                                <span className="text-zinc-200">{option}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {/* File Upload */}
            {field.type === "file_upload" && (
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                onFileUpload(file);
                            }
                        }}
                        className="hidden"
                    />
                    {value ? (
                        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-700 rounded-xl">
                            <AttachmentIcon className="size-5 text-amber-500" />
                            <span className="flex-1 text-zinc-200 truncate">
                                {(value as RegistrationAttachment).name}
                            </span>
                            <button
                                type="button"
                                onClick={() => onChange(undefined)}
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                <CloseIcon className="size-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef?.(document.createElement("input"))}
                            disabled={isUploading}
                            className={clsx(
                                "w-full p-6 border-2 border-dashed rounded-xl transition-all text-center",
                                isUploading
                                    ? "border-zinc-700 bg-zinc-900/30 cursor-not-allowed"
                                    : "border-zinc-700 bg-zinc-900/30 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer"
                            )}
                        >
                            {isUploading ? (
                                <div className="flex items-center justify-center gap-2 text-zinc-400">
                                    <LoadingSpinner className="size-5" />
                                    Uploading...
                                </div>
                            ) : (
                                <div className="text-zinc-400">
                                    <UploadIcon className="mx-auto size-8 mb-2" />
                                    <p className="text-sm">Click to upload a file</p>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Icons
function LoadingSpinner({ className }: { className?: string }) {
    return (
        <svg className={clsx("animate-spin", className)} viewBox="0 0 24 24" fill="none">
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

function ErrorIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function AttachmentIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
        </svg>
    );
}

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

