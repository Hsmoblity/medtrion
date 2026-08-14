/**
 * ProductSpecifications Component
 * Displays product specifications in a table format
 */

interface ProductSpecification {
  label: string
  value: string
}

interface ProductSpecificationsProps {
  specifications: ProductSpecification[]
}

export default function ProductSpecifications({
  specifications
}: ProductSpecificationsProps) {
  return (
    <div className="mt-16 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0b1f3a]">Product Specifications</h2>
        <div className="mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-[#0b1f3a]/10">
            {specifications.map((spec, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0
                    ? 'bg-white'
                    : 'bg-gradient-to-r from-[#f8fbff] to-[#f2fbfa]'
                } hover:bg-[#fef7eb] transition-colors duration-200`}
              >
                <td className="px-6 py-4 font-semibold text-[#0b1f3a]">
                  {spec.label}
                </td>
                <td className="px-6 py-4 text-gray-700">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}